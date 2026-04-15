import { createUnplugin } from 'unplugin'
import MagicString from 'magic-string'
import { hash64 } from '@continuouslabs/lumina'
import fs from 'fs'
import path from 'path'
import { parse } from '@babel/parser'
import * as _traverse from '@babel/traverse'

/**
 * Lumina Plugin Options
 */
export interface LuminaPluginOptions {
  /** Directory where extracted keys and stub locales will be saved. Defaults to .lumina/locales */
  outputDir?: string
  /** List of locales to initialize (e.g., ['en', 'es']). */
  locales?: string[]
}

/** 
 * Persistent map to track extracted keys during the build process.
 * This ensures we only write unique keys to the original.json file.
 */
const EXTRACTED_KEYS = new Map<string, string>()

/**
 * Tags that should NEVER be translated.
 */
const NON_TRANSLATABLE_TAGS = new Set(['code', 'pre', 'script', 'style', 'textarea'])

/**
 * Ensures strings are safe to be placed inside a backtick template literal.
 */
function escapeForTemplateLiteral(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
}

/**
 * The core Lumina Unplugin.
 * 
 * This is the "brain" of the compile-time i18n system. It handles:
 * 1. Automatic extraction of text from 't' attributes or t() function calls.
 * 2. Rewriting source code to use reactive runtime translations.
 * 3. Managing virtual modules for Zero-Config initialization.
 */
export const luminaUnplugin = createUnplugin((options: LuminaPluginOptions = {}) => {
  const outputDir = options.outputDir || path.join(process.cwd(), '.lumina/locales')
  const locales = options.locales || []

  return {
    name: 'unplugin-lumina-i18n',
    enforce: 'pre', // Run before other plugins/loaders to see original JSX/Astro syntax

    /**
     * Build initialization hook.
     * Checks for lumina.config.json and prepares the output directory.
     */
    buildStart() {
      const configPath = path.join(process.cwd(), 'lumina.config.json')
      let config: any = {}
      if (fs.existsSync(configPath)) {
        try {
          config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
          console.log('[Lumina] Loaded project configuration.')
        } catch (e) {
          console.warn('[Lumina] Failed to parse lumina.config.json')
        }
      }

      // Ensure the .lumina/locales directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }
      
      // Create empty stubs for defined locales if they don't exist
      const targetLocales = config.locales || locales
      for (const locale of targetLocales) {
        const localePath = path.join(outputDir, locale + '.json')
        if (!fs.existsSync(localePath)) {
          fs.writeFileSync(localePath, '{}\n')
          console.log('[Lumina] Created stub locale file: ' + localePath)
        }
      }
    },

    /**
     * Virtual Module Resolution.
     * Handles the magic '@lumina/config' import used for Zero-Config.
     */
    resolveId(id) {
      if (id === '@lumina/config') {
        // We route to a virtual file in the .lumina directory
        return path.resolve(process.cwd(), '.lumina/virtual-config.mjs')
      }
      return null
    },

    /**
     * Virtual Module Loading.
     * Generates a dynamic JS module that embeds all project translations.
     * This allows runtime adapters to import a single object with everything they need.
     */
    load(id) {
      if (id === '@lumina/config' || id.includes('.lumina/virtual-config.mjs')) {
        const configPath = path.join(process.cwd(), 'lumina.config.json')
        const config = fs.existsSync(configPath) 
          ? JSON.parse(fs.readFileSync(configPath, 'utf-8'))
          : { defaultLocale: 'en', locales: ['en'] }

        let imports = ''
        let messages = '{\n'
        
        // Generate static imports for each JSON dictionary
        config.locales.forEach((locale: string) => {
          const varName = `locale_${locale.replace('-', '_')}`
          const fullPath = path.join(process.cwd(), '.lumina/locales', `${locale}.json`)
          imports += `import ${varName} from '${fullPath}'\n`
          messages += `  '${locale}': ${varName},\n`
        })
        messages += '}'

        return `
${imports}
export const config = {
  locale: '${config.defaultLocale || 'en'}',
  defaultLocale: '${config.defaultLocale || 'en'}',
  locales: ${JSON.stringify(config.locales)},
  messages: ${messages}
}
export default config
`
      }
      return null
    },

    /**
     * The main transformation entry point.
     * Dispatches the source code to the framework-aware transformation engine.
     */
    transform(code: string, id: string) {
      return transformLuminaCode(code, id, options)
    },

    /**
     * Build end hook.
     * Flushes all extracted keys to 'original.json' for the AI translation CLI.
     */
    buildEnd() {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      const originalPath = path.join(outputDir, 'original.json')
      const existing = fs.existsSync(originalPath)
        ? JSON.parse(fs.readFileSync(originalPath, 'utf-8'))
        : {}

      const updated = {
        ...existing,
        ...Object.fromEntries(EXTRACTED_KEYS)
      }

      fs.writeFileSync(originalPath, JSON.stringify(updated, null, 2))
      console.log('[Lumina] Extraction complete. ' + EXTRACTED_KEYS.size + ' keys synced to ' + originalPath)
    }
  }
})

// Bundler-specific plugin exports
export const vitePlugin = luminaUnplugin.vite
export const webpackPlugin = luminaUnplugin.webpack
export const rollupPlugin = luminaUnplugin.rollup
export const esbuildPlugin = luminaUnplugin.esbuild

/**
 * Main transformation engine for Lumina i18n.
 * 
 * This function parses source code and performs surgical mutations 
 * using Babel for AST analysis and MagicString for non-destructive updates.
 * 
 * It supports:
 * - React (JSX/TSX)
 * - Vue (.vue)
 * - Astro (.astro)
 * - Vanilla JS/TS
 * 
 * @param code The source code of the file.
 * @param id The absolute path of the file.
 * @param options Plugin options.
 */
export function transformLuminaCode(code: string, id: string, options: LuminaPluginOptions = {}) {
  // Only process standard web formats
  if (!id.match(/\.(?:[jt]sx?|vue|astro)$/) || id.includes('node_modules')) return null

  const s = new MagicString(code)
  let hasChanged = false

  /**
   * Helper to transform standard JavaScript/TypeScript code using Babel.
   */
  const transformJS = (jsCode: string, offset = 0) => {
    try {
      const ast = parse(jsCode, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
        errorRecovery: true
      })

      const traverseFn = (_traverse as any).default || _traverse
      let needsVirtualConfig = false

      traverseFn(ast, {
        /**
         * Handle JSX elements.
         * Looks for <Tag t> or <Tag i18n> and wraps their content.
         */
        JSXOpeningElement(pathNode: any) {
          const node = pathNode.node
          const tagName = node.name.name || ''

          // 1. Magic Provider Injection: Automatically passing config to LuminaProvider
          if (tagName === 'LuminaProvider') {
            const hasOptions = node.attributes.some(
              (attr: any) => attr.type === 'JSXAttribute' && attr.name.name === 'options'
            )
            
            if (!hasOptions) {
              s.appendLeft(node.name.end + offset, ' options={__LUMINA_CONFIG__}')
              needsVirtualConfig = true
              hasChanged = true
            }
          }

          // Ignore tags like <code> or <script>
          if (NON_TRANSLATABLE_TAGS.has(tagName)) return

          // 2. Attribute 't' or 'i18n' Extraction
          const tAttrIndex = node.attributes.findIndex(
            (attr: any) => attr.type === 'JSXAttribute' && (attr.name.name === 't' || attr.name.name === 'i18n')
          )
          
          if (tAttrIndex !== -1) {
            const tAttrNode = node.attributes[tAttrIndex]
            const parentElement = pathNode.parent
            let extractedText = ''

            // Combine all static parts of the children into a single translatable string
            parentElement.children.forEach((child: any) => {
              if (child.type === 'JSXText') {
                extractedText += child.value
              } else if (child.type === 'JSXExpressionContainer') {
                // We mark expressions with a universal placeholder for stable hashing
                extractedText += '{expr}'
              }
            })

            const cleanContent = extractedText.trim()

            if (cleanContent) {
              const hash = 'id_' + hash64(cleanContent)
              EXTRACTED_KEYS.set(hash, cleanContent)

              const escaped = escapeForTemplateLiteral(cleanContent)
              // Rewrite the content to call the runtime client
              const replacement = '{(globalThis.__lumina?.getText(' + "'" + hash + "'" + ', `' + escaped + '`) ?? `' + escaped + '`)}'

              const contentStart = node.end + offset
              const contentEnd = (parentElement.closingElement ? parentElement.closingElement.start : contentStart) + offset

              s.overwrite(contentStart, contentEnd, replacement)

              // Surgical removal of the 't' attribute to keep source clean
              let attrStart = tAttrNode.start + offset
              let attrEnd = tAttrNode.end + offset
              if (jsCode[tAttrNode.start - 1] === ' ') attrStart -= 1
              s.remove(attrStart, attrEnd)
              hasChanged = true
            }
          }
        },

        /**
         * Handle function calls.
         * Looks for t("Hello") or initLumina().
         */
        CallExpression(pathNode: any) {
          const node = pathNode.node
          
          // 3. Magic Init Injection: Auto-inject config into createLumina() or initLumina()
          if (node.callee.type === 'Identifier' && (node.callee.name === 'createLumina' || node.callee.name === 'initLumina')) {
            if (node.arguments.length === 0) {
              s.appendLeft(node.end - 1 + offset, '__LUMINA_CONFIG__')
              needsVirtualConfig = true
              hasChanged = true
            }
          }

          // 4. Function 't()' Extraction: Simple translation hook
          if (node.callee.type === 'Identifier' && node.callee.name === 't') {
            const arg = node.arguments[0]
            if (arg && (arg.type === 'StringLiteral' || arg.type === 'TemplateLiteral')) {
              const content = arg.type === 'StringLiteral' ? arg.value : ''
              if (content) {
                const hash = 'id_' + hash64(content)
                EXTRACTED_KEYS.set(hash, content)
                const escaped = escapeForTemplateLiteral(content)
                const replacement = '(globalThis.__lumina?.getText(' + "'" + hash + "'" + ', `' + escaped + '`) ?? `' + escaped + '`)'
                
                s.overwrite(node.start + offset, node.end + offset, replacement)
                hasChanged = true
              }
            }
          }
        }
      })

      // If we used the magic __LUMINA_CONFIG__, we need to import it at the top of the file
      if (needsVirtualConfig) {
        const importStmt = "import __LUMINA_CONFIG__ from '@lumina/config'\n"
        
        let insertPos = 0
        if (ast.program.directives && ast.program.directives.length > 0) {
          const lastDirective = ast.program.directives[ast.program.directives.length - 1]
          insertPos = lastDirective.end! + offset
          s.appendRight(insertPos, '\n' + importStmt)
        } else {
          s.prepend(importStmt)
        }
      }
    } catch (err) {
      console.warn('[Lumina] Failed to transform JS in ' + id + ':', err)
    }
  }

  /**
   * Helper to transform Template-based code (Vue <template> or Astro HTML).
   * Uses Regex for fast and surgical attribute extraction in markup.
   */
  const transformTemplate = (templateCode: string, offset: number, syntax: 'vue' | 'astro') => {
    // Looks for <tag t>content</tag> or <tag i18n>content</tag>
    const tagRegex = /<([a-z0-9-]+)[^>]*\s(t|i18n)\s*[^>]*>([\s\S]*?)<\/\1>/gi
    let match
    while ((match = tagRegex.exec(templateCode)) !== null) {
      const [fullMatch, tagName, tAttr, content] = match
      
      // Normalize dynamic expressions inside templates to {expr} for consistent hashing
      const normalizedContent = content.trim()
        .replace(/\{\{[\s\S]*?\}\}/g, '{expr}')
        .replace(/\{[^\}]+\}/g, (m) => m === '{expr}' ? m : '{expr}')

      if (normalizedContent && !NON_TRANSLATABLE_TAGS.has(tagName)) {
        const hash = 'id_' + hash64(normalizedContent)
        EXTRACTED_KEYS.set(hash, normalizedContent)
        const escaped = escapeForTemplateLiteral(normalizedContent)
        
        // Use single braces {} for Astro, double braces {{}} for Vue
        const replacementContent = syntax === 'astro' 
          ? `{ (globalThis.__lumina?.getText('${hash}', \`${escaped}\`) ?? \`${escaped}\`) }`
          : `{{ (globalThis.__lumina?.getText('${hash}', \`${escaped}\`) ?? \`${escaped}\`) }}`
        
        const start = offset + match.index + fullMatch.indexOf(content)
        const end = start + content.length
        s.overwrite(start, end, replacementContent)

        // Remove the 't' indicator attribute
        const tStart = offset + match.index + fullMatch.indexOf(` ${tAttr}`)
        const tEnd = tStart + tAttr.length + 1
        s.remove(tStart, tEnd)
        hasChanged = true
      }
    }
  }

  // Framework-specific pre-processing
  if (id.endsWith('.vue')) {
    // Process Vue SFC by splitting scripts and templates
    const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/)
    if (scriptMatch) {
      transformJS(scriptMatch[1], scriptMatch.index! + scriptMatch[0].indexOf(scriptMatch[1]))
    }

    const templateMatch = code.match(/<template>([\s\S]*?)<\/template>/)
    if (templateMatch) {
      transformTemplate(templateMatch[1], templateMatch.index! + templateMatch[0].indexOf(templateMatch[1]), 'vue')
    }
  } else if (id.endsWith('.astro')) {
    // Process Astro files by handling the frontmatter (JS) and body (HTML)
    const astroMatch = code.match(/^---([\s\S]*?)---/)
    if (astroMatch) {
      transformJS(astroMatch[1], astroMatch.index! + 3) // +3 for leading '---'
      
      const templateCode = code.slice(astroMatch[0].length)
      transformTemplate(templateCode, astroMatch[0].length, 'astro')
    } else {
      // Pure HTML style Astro file
      transformTemplate(code, 0, 'astro')
    }
  } else {
    // Standard JS/TS file
    transformJS(code, 0)
  }

  if (!hasChanged) return null

  return {
    code: s.toString(),
    map: s.generateMap({ hires: true })
  }
}

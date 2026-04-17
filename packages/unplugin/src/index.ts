import { createUnplugin } from 'unplugin'
import MagicString from 'magic-string'
import { hash64 } from '@continuouslabs/lumina'
import fs from 'fs'
import path from 'path'
import { parse } from '@babel/parser'
import _traverse from '@babel/traverse'

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
export const EXTRACTED_KEYS = new Map<string, string>()

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
    name: 'unplugin-lumina',
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
          console.log(`[Lumina] Loaded project configuration from ${configPath}`)
        } catch (e) {
          console.warn(`[Lumina] Failed to parse lumina.config.json at ${configPath}`)
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
     * The main transformation entry point.
     * Dispatches the source code to the framework-aware transformation engine.
     */
    transform(code: string, id: string) {
      if (!id) return null
      if (id.includes('.vue') || id.includes('.astro') || id.includes('.svelte') || id.includes('.tsx') || id.includes('.jsx') || id.includes('.html')) {
        // console.log(`[Lumina] Transforming: ${id}`)
      }
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
  // Only process standard web formats (supports query parameters in ID, common in Webpack/Next.js)
  if (!id.match(/\.(?:[jt]sx?|vue|astro|svelte|html)(?:\?.*)?$/) || id.includes('node_modules')) return null

  const s = new MagicString(code)
  let hasChanged = false

  /**
   * Helper to transform standard JavaScript/TypeScript code using Babel.
   */
  const transformJS = (jsCode: string, offset = 0) => {
    try {
      const ast = parse(jsCode, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript', 'decorators-legacy'],
        errorRecovery: true
      })

      const traverseFn = (typeof _traverse === 'function') 
        ? _traverse 
        : ((_traverse as any).default?.default || (_traverse as any).default || _traverse)
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
            const children = parentElement?.children
            if (Array.isArray(children)) {
              for (const child of children) {
                if (child.type === 'JSXText') {
                  extractedText += child.value
                } else if (child.type === 'JSXExpressionContainer') {
                  // We mark expressions with a universal placeholder for stable hashing
                  extractedText += '{expr}'
                }
              }
            }

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
        },

        /**
         * 5. Vanilla Template Literal Extraction.
         * Looks for HTML strings inside backticks with a 't' attribute.
         */
        TemplateLiteral(pathNode: any) {
          const node = pathNode.node
          // Only process simple template literals for now (no expressions inside markup for simplicity)
          if (node.quasis.length === 1) {
            const raw = node.quasis[0].value.raw
            if (raw.includes(' t>') || raw.includes(' i18n>')) {
              // We reuse transformTemplate logic for consistent behavior
              // But we have to be careful about not breaking the surrounding file
              // For vanilla JS, we just extract the keys for translation.
              // Note: We don't perform surgery inside the template literal yet to keep it stable
              // as vanilla JS usually doesn't have a built-in reactive DOM engine.
              const tagRegex = /<([a-z0-9-]+)[^>]*\s(t|i18n)(?=\s|>|=)\s*[^>]*>([\s\S]*?)<\/\1>/gi
              let match
              while ((match = tagRegex.exec(raw)) !== null) {
                const content = match[3].trim()
                if (content) {
                  const hash = 'id_' + hash64(content)
                  EXTRACTED_KEYS.set(hash, content)
                }
              }
            }
          }
        }
      })

      // If we used the magic __LUMINA_CONFIG__, we need to define it at the top of the file
      if (needsVirtualConfig) {
        // Build the inlined config object
        const configPath = path.join(process.cwd(), 'lumina.config.json')
        let rawConfig: any = {}
        if (fs.existsSync(configPath)) {
          try {
            rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
          } catch (e) {
            console.warn(`[Lumina] Error parsing config for inlining at ${id}:`, e)
          }
        }
        
        const config = {
          defaultLocale: rawConfig.defaultLocale || 'en',
          locales: rawConfig.locales || ['en'],
          autoDetect: !!rawConfig.autoDetect
        }

        let messages = '{'
        const localeList = config.locales
        for (let i = 0; i < localeList.length; i++) {
          const locale = localeList[i]
          const fullPath = path.join(process.cwd(), '.lumina/locales', `${locale}.json`)
          const content = fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf-8') : '{}'
          messages += `"${locale}": ${content}${i === localeList.length - 1 ? '' : ','}`
        }
        messages += '}'

        const inlinedConfig = `{
          locale: '${config.defaultLocale}',
          defaultLocale: '${config.defaultLocale}',
          locales: ${JSON.stringify(config.locales)},
          autoDetect: ${config.autoDetect},
          messages: ${messages}
        }`

        const definitionStmt = `const __LUMINA_CONFIG__ = ${inlinedConfig};\n`
        
        let insertPos = 0
        if (ast.program.directives && ast.program.directives.length > 0) {
          const lastDirective = ast.program.directives[ast.program.directives.length - 1]
          insertPos = lastDirective.end! + offset
          s.appendRight(insertPos, '\n' + definitionStmt)
        } else {
          s.prepend(definitionStmt)
        }
      }
    } catch (err) {
      console.warn('[Lumina] Failed to transform JS in ' + id + ':', err)
    }
  }

  /**
   * Helper to transform Template-based code (Vue <template>, Astro HTML, or Angular HTML).
   * Uses Regex for fast and surgical attribute extraction in markup.
   */
  const transformTemplate = (templateCode: string, offset: number, syntax: 'vue' | 'astro' | 'angular' | 'svelte') => {
    // Looks for <tag t>content</tag> or <tag i18n>content</tag>
    const tagRegex = /<([a-z0-9-]+)[^>]*\s(t|i18n)(?=\s|>|=)\s*[^>]*>([\s\S]*?)<\/\1>/gi
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
        console.log(`[Lumina] Extracted key: "${normalizedContent.substring(0, 30)}${normalizedContent.length > 30 ? '...' : ''}" (${hash}) from ${id}`)
        const escaped = escapeForTemplateLiteral(normalizedContent)
        
        if (syntax === 'angular') {
          // Angular Strategy: We don't replace the content (to avoid breaking Angular expressions).
          // Instead, we explicitly set the hash on the 't' attribute so the directive can find it.
          const tStart = offset + match.index + fullMatch.indexOf(` ${tAttr}`)
          const tEnd = tStart + tAttr.length + 1
          s.overwrite(tStart, tEnd, ` ${tAttr}="${hash}"`)
        } else {
          // React/Vue/Astro Strategy: Replace the text node with a call to the runtime
          const replacementContent = (syntax === 'astro' || syntax === 'svelte') 
            ? `{ (globalThis.__lumina?.getText('${hash}', \`${escaped}\`) ?? \`${escaped}\`) }`
            : `{{ (globalThis.__lumina?.getText('${hash}', \`${escaped}\`) ?? \`${escaped}\`) }}`
          
          const start = offset + match.index + fullMatch.indexOf(content)
          const end = start + content.length
          s.overwrite(start, end, replacementContent)

          // Remove the 't' indicator attribute
          const tStart = offset + match.index + fullMatch.indexOf(` ${tAttr}`)
          const tEnd = tStart + tAttr.length + 1
          s.remove(tStart, tEnd)
        }
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
  } else if (id.endsWith('.html')) {
    // Pure Angular HTML template
    transformTemplate(code, 0, 'angular')
  } else if (id.endsWith('.svelte')) {
    // Svelte Files: script and template
    const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/)
    if (scriptMatch) {
      transformJS(scriptMatch[1], scriptMatch.index! + scriptMatch[0].indexOf(scriptMatch[1]))
    }
    // Svelte uses single braces {}, similar to astro in terms of output replacement
    transformTemplate(code, 0, 'svelte')
  } else {
    // Standard JS/TS file.
    // In Angular, components often have inline templates.
    const inlineTemplateMatch = code.match(/template:\s*`([\s\S]*?)`/)
    if (inlineTemplateMatch) {
      transformTemplate(inlineTemplateMatch[1], inlineTemplateMatch.index! + inlineTemplateMatch[0].indexOf(inlineTemplateMatch[1]), 'angular')
    }
    transformJS(code, 0)
  }

  if (!hasChanged) return null

  return {
    code: s.toString(),
    map: s.generateMap({ hires: true })
  }
}

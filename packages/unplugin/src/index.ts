import { createUnplugin } from 'unplugin'
import MagicString from 'magic-string'
import { hash64 } from '@continuouslabs/lumina'
import fs from 'fs'
import path from 'path'
import { parse } from '@babel/parser'
import * as _traverse from '@babel/traverse'

export interface LuminaPluginOptions {
  outputDir?: string
  locales?: string[]
}

const EXTRACTED_KEYS = new Map<string, string>()

const NON_TRANSLATABLE_TAGS = new Set(['code', 'pre', 'script', 'style', 'textarea'])

function escapeForTemplateLiteral(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
}

export const luminaUnplugin = createUnplugin((options: LuminaPluginOptions = {}) => {
  const outputDir = options.outputDir || path.join(process.cwd(), '.lumina/locales')
  const locales = options.locales || []

  return {
    name: 'unplugin-lumina-i18n',
    enforce: 'pre',

    buildStart() {
      // Load lumina.config.json if it exists
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

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }
      
      const targetLocales = config.locales || locales
      for (const locale of targetLocales) {
        const localePath = path.join(outputDir, locale + '.json')
        if (!fs.existsSync(localePath)) {
          fs.writeFileSync(localePath, '{}\n')
          console.log('[Lumina] Created stub locale file: ' + localePath)
        }
      }
    },

    resolveId(id) {
      if (id === '@lumina/config') {
        // Use a pseudo-absolute path that works across all bundlers.
        // Webpack follows this path, and we intercept it in the load hook.
        return path.resolve(process.cwd(), '.lumina/virtual-config.mjs')
      }
      return null
    },

    load(id) {
      if (id === '@lumina/config' || id.includes('.lumina/virtual-config.mjs')) {
        const configPath = path.join(process.cwd(), 'lumina.config.json')
        const config = fs.existsSync(configPath) 
          ? JSON.parse(fs.readFileSync(configPath, 'utf-8'))
          : { defaultLocale: 'en', locales: ['en'] }

        const outputRelative = path.relative(process.cwd(), path.join(process.cwd(), '.lumina/locales'))
        
        let imports = ''
        let messages = '{\n'
        
        config.locales.forEach((locale: string) => {
          const varName = `locale_${locale.replace('-', '_')}`
          // We use public path or relative path depending on the bundler, 
          // but for virtual modules, absolute path is often safest or relative to project root.
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

    transform(code: string, id: string) {
      return transformLuminaCode(code, id, options)
    },

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

export const vitePlugin = luminaUnplugin.vite
export const webpackPlugin = luminaUnplugin.webpack
export const rollupPlugin = luminaUnplugin.rollup
export const esbuildPlugin = luminaUnplugin.esbuild

/**
 * Main transformation engine for Lumina i18n.
 * Extracted into a standalone function for testing purposes.
 */
export function transformLuminaCode(code: string, id: string, options: LuminaPluginOptions = {}) {
  if (!id.match(/\.(?:[jt]sx?|vue|astro)$/) || id.includes('node_modules')) return null

  const s = new MagicString(code)
  let hasChanged = false

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
        JSXOpeningElement(pathNode: any) {
          const node = pathNode.node
          const tagName = node.name.name || ''

          // 1. Magic Provider Injection
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

          // 2. Attribute 't' Extraction
          if (NON_TRANSLATABLE_TAGS.has(tagName)) return

          const tAttrIndex = node.attributes.findIndex(
            (attr: any) => attr.type === 'JSXAttribute' && (attr.name.name === 't' || attr.name.name === 'i18n')
          )
          
          if (tAttrIndex !== -1) {
            const tAttrNode = node.attributes[tAttrIndex]
            const parentElement = pathNode.parent
            let extractedText = ''

            parentElement.children.forEach((child: any) => {
              if (child.type === 'JSXText') {
                extractedText += child.value
              } else if (child.type === 'JSXExpressionContainer') {
                extractedText += '{expr}'
              }
            })

            const cleanContent = extractedText.trim()

            if (cleanContent) {
              const hash = 'id_' + hash64(cleanContent)
              EXTRACTED_KEYS.set(hash, cleanContent)

              const escaped = escapeForTemplateLiteral(cleanContent)
              const replacement = '{(globalThis.__lumina?.getText(' + "'" + hash + "'" + ', `' + escaped + '`) ?? `' + escaped + '`)}'

              const contentStart = node.end + offset
              const contentEnd = (parentElement.closingElement ? parentElement.closingElement.start : contentStart) + offset

              s.overwrite(contentStart, contentEnd, replacement)

              // Remove the 't' attribute
              let attrStart = tAttrNode.start + offset
              let attrEnd = tAttrNode.end + offset
              if (jsCode[tAttrNode.start - 1] === ' ') attrStart -= 1
              s.remove(attrStart, attrEnd)
              hasChanged = true
            }
          }
        },

        CallExpression(pathNode: any) {
          const node = pathNode.node
          
          // 3. Magic Init Injection
          if (node.callee.type === 'Identifier' && (node.callee.name === 'createLumina' || node.callee.name === 'initLumina')) {
            if (node.arguments.length === 0) {
              s.appendLeft(node.end - 1 + offset, '__LUMINA_CONFIG__')
              needsVirtualConfig = true
              hasChanged = true
            }
          }

          // 4. Function 't()' Extraction
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

  const transformTemplate = (templateCode: string, offset: number, syntax: 'vue' | 'astro') => {
    // Regex-based 't' or 'i18n' attribute extraction for Templates (Vue/Astro)
    const tagRegex = /<([a-z0-9-]+)[^>]*\s(t|i18n)\s*[^>]*>([\s\S]*?)<\/\1>/gi
    let match
    while ((match = tagRegex.exec(templateCode)) !== null) {
      const [fullMatch, tagName, tAttr, content] = match
      
      // Normalize expressions to {expr} to match JSX behavior
      // This handles {{vue}} and {astro} styles
      const normalizedContent = content.trim()
        .replace(/\{\{[\s\S]*?\}\}/g, '{expr}')
        .replace(/\{[^\}]+\}/g, (m) => m === '{expr}' ? m : '{expr}')

      if (normalizedContent && !NON_TRANSLATABLE_TAGS.has(tagName)) {
        const hash = 'id_' + hash64(normalizedContent)
        EXTRACTED_KEYS.set(hash, normalizedContent)
        const escaped = escapeForTemplateLiteral(normalizedContent)
        
        // Use single braces for Astro, double for Vue
        const replacementContent = syntax === 'astro' 
          ? `{ (globalThis.__lumina?.getText('${hash}', \`${escaped}\`) ?? \`${escaped}\`) }`
          : `{{ (globalThis.__lumina?.getText('${hash}', \`${escaped}\`) ?? \`${escaped}\`) }}`
        
        const start = offset + match.index + fullMatch.indexOf(content)
        const end = start + content.length
        s.overwrite(start, end, replacementContent)

        // Remove 't' or 'i18n' attribute
        const tStart = offset + match.index + fullMatch.indexOf(` ${tAttr}`)
        const tEnd = tStart + tAttr.length + 1
        s.remove(tStart, tEnd)
        hasChanged = true
      }
    }
  }

  if (id.endsWith('.vue')) {
    const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/)
    if (scriptMatch) {
      transformJS(scriptMatch[1], scriptMatch.index! + scriptMatch[0].indexOf(scriptMatch[1]))
    }

    const templateMatch = code.match(/<template>([\s\S]*?)<\/template>/)
    if (templateMatch) {
      transformTemplate(templateMatch[1], templateMatch.index! + templateMatch[0].indexOf(templateMatch[1]), 'vue')
    }
  } else if (id.endsWith('.astro')) {
    // Astro Frontmatter: --- content ---
    const astroMatch = code.match(/^---([\s\S]*?)---/)
    if (astroMatch) {
      transformJS(astroMatch[1], astroMatch.index! + 3) // +3 for '---'
      
      const templateCode = code.slice(astroMatch[0].length)
      transformTemplate(templateCode, astroMatch[0].length, 'astro')
    } else {
      // No frontmatter, treat whole thing as template
      transformTemplate(code, 0, 'astro')
    }
  } else {
    transformJS(code, 0)
  }

  if (!hasChanged) return null

  return {
    code: s.toString(),
    map: s.generateMap({ hires: true })
  }
}

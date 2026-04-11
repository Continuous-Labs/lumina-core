import { createUnplugin } from 'unplugin'
import MagicString from 'magic-string'
import { hash64 } from '@continuouslabs/lumina'
import fs from 'fs'
import path from 'path'
import * as swc from '@swc/core'

export interface LuminaPluginOptions {
  outputDir?: string
  locales?: string[]
}

const EXTRACTED_KEYS = new Map<string, string>()

export const luminaUnplugin = createUnplugin((options: LuminaPluginOptions = {}) => {
  const outputDir = options.outputDir || path.join(process.cwd(), '.lumina/locales')
  
  return {
    name: 'unplugin-lumina-i18n',
    
    async transform(code: string, id: string) {
      if (!id.match(/\.[jt]sx?$/) || id.includes('node_modules')) return
      
      const s = new MagicString(code)
      let hasChanged = false
      
      try {
        const ast = await swc.parse(code, {
          syntax: id.endsWith('.tsx') || id.endsWith('.jsx') ? 'typescript' : 'typescript',
          tsx: id.endsWith('.tsx') || id.endsWith('.jsx'),
          comments: true,
          script: false,
        })

        // Recursive walker to find translation markers
        const walk = (node: any) => {
          if (!node) return

          // 1. Handle JSX Elements with 't' attribute
          if (node.type === 'JSXOpeningElement') {
            const tAttr = node.attributes.find((attr: any) => 
              attr.type === 'JSXAttribute' && attr.name.value === 't'
            )
            
            if (tAttr) {
              // The parent JSXElement is the target for children extraction
              // We need to trace back or find the siblings.
              // For simplicity in this walker, we usually find JSXElement.
            }
          }

          if (node.type === 'JSXElement') {
            const hasT = node.opening.attributes.some((attr: any) => 
               attr.type === 'JSXAttribute' && attr.name.value === 't'
            )

            if (hasT) {
              let extractedText = ''
              let placeholderCount = 0
              
              node.children.forEach((child: any) => {
                if (child.type === 'JSXText') {
                  extractedText += child.value
                } else if (child.type === 'JSXExpressionContainer') {
                  extractedText += `{${placeholderCount++}}`
                }
              })

              const cleanContent = extractedText.trim()
              
              if (cleanContent) {
                const hash = `id_${hash64(cleanContent)}`
                EXTRACTED_KEYS.set(hash, cleanContent)
                
                // For the replacement, we need to preserve the actual expressions
                // Simplified for PoC: we use template literals with the variables
                let replacement = `{\`\${__lumina.getText('${hash}', \`${cleanContent}\`)}\`}`
                // Re-inject variables (This part is complex as we need to map {0} back to the actual expression)
                // For now, we keep the raw string and let the runtime handle interpolation if possible,
                // or we use a sophisticated replacement.
                
                s.overwrite(
                  node.opening.span.end, 
                  node.closing?.span.start ?? node.opening.span.end, 
                  `{__lumina.getText('${hash}', \`${cleanContent}\`)}`
                )
                
                // Remove the 't' attribute from the opening tag
                const tAttr = node.opening.attributes.find((attr: any) => attr.name.value === 't')
                s.remove(tAttr.span.start, tAttr.span.end)
                
                hasChanged = true
              }
            }
          }

          // 2. Handle t('...') call expressions
          if (node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.value === 't') {
            const arg = node.arguments[0]?.expression
            if (arg && (arg.type === 'StringLiteral' || arg.type === 'TemplateLiteral')) {
              const content = arg.type === 'StringLiteral' ? arg.value : code.substring(arg.span.start + 1, arg.span.end - 1)
              const hash = `id_${hash64(content)}`
              EXTRACTED_KEYS.set(hash, content)
              
              s.overwrite(node.span.start, node.span.end, `__lumina.getText('${hash}', \`${content}\`)`)
              hasChanged = true
            }
          }

          // Traverse all children
          for (const key in node) {
            const child = node[key]
            if (Array.isArray(child)) {
              child.forEach(walk)
            } else if (typeof child === 'object' && child?.type) {
              walk(child)
            }
          }
        }

        walk(ast)

      } catch (err) {
        console.warn(`[Lumina] Failed to parse ${id}:`, err)
      }

      if (!hasChanged) return null

      return {
        code: s.toString(),
        map: s.generateMap({ hires: true })
      }
    },

    buildEnd() {
      if (EXTRACTED_KEYS.size === 0) return

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      const originalPath = path.join(outputDir, 'original.json')
      const existing = fs.existsSync(originalPath) ? JSON.parse(fs.readFileSync(originalPath, 'utf-8')) : {}
      
      const updated = {
        ...existing,
        ...Object.fromEntries(EXTRACTED_KEYS)
      }

      fs.writeFileSync(originalPath, JSON.stringify(updated, null, 2))
      console.log(`[Lumina] Extracted ${EXTRACTED_KEYS.size} keys to ${originalPath}`)
    }
  }
})

export const vitePlugin = luminaUnplugin.vite
export const webpackPlugin = luminaUnplugin.webpack
export const rollupPlugin = luminaUnplugin.rollup
export const esbuildPlugin = luminaUnplugin.esbuild

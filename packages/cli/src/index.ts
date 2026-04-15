import { cac } from 'cac'
import pc from 'picocolors'
import fs from 'fs'
import path from 'path'
import { GeminiProvider } from './providers/gemini.js'
import { OllamaProvider } from './providers/ollama.js'
import { OpenAIProvider } from './providers/openai.js'
import { AnthropicProvider } from './providers/anthropic.js'
import 'dotenv/config'

const cli = cac('lumina')

cli
  .command('init', 'Initialize Lumina i18n in current project')
  .action(() => {
    console.log(pc.cyan('\n  ✨ Initializing Lumina i18n...\n'))
    
    const configPath = path.join(process.cwd(), 'lumina.config.json')
    const localesDir = path.join(process.cwd(), '.lumina/locales')
    
    if (!fs.existsSync(localesDir)) {
      fs.mkdirSync(localesDir, { recursive: true })
    }
    
    const defaultConfig = {
      defaultLocale: 'en',
      locales: ['en', 'es'],
      outputDir: './.lumina/locales'
    }
    
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2))
    
    console.log(pc.green('  ✅ Created lumina.config.json'))
    console.log(pc.green('  ✅ Created .lumina/locales directory\n'))
    console.log(pc.white('  Now add the Lumina plugin to your build tool (Vite/Webpack/etc.)\n'))
  })

cli
  .command('translate', 'Translate extracted strings using AI')
  .option('--provider <provider>', 'AI Provider (gemini, ollama, openai, anthropic)')
  .action(async (options) => {
    console.log(pc.cyan('\n  🤖 Starting Lumina AI Translation...\n'))
    
    const configPath = path.join(process.cwd(), 'lumina.config.json')
    if (!fs.existsSync(configPath)) {
      console.log(pc.red('  ❌ lumina.config.json not found. Run "lumina init" first.'))
      return
    }
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    const localesDir = path.resolve(config.outputDir || './.lumina/locales')
    const originalPath = path.join(localesDir, 'original.json')
    
    if (!fs.existsSync(originalPath)) {
      console.log(pc.red('  ❌ original.json not found. Run a build first to extract keys.'))
      return
    }
    
    const original = JSON.parse(fs.readFileSync(originalPath, 'utf-8'))
    const keys = Object.keys(original)
    const targetLocales = config.locales.filter((l: string) => l !== config.defaultLocale)
    
    // Provider Selection
    const providerName = options.provider || config.provider || 'gemini'
    let provider
    
    if (providerName === 'gemini') {
      provider = new GeminiProvider({
        apiKey: process.env.LUMINA_GEMINI_API_KEY || config.gemini?.apiKey || config.apiKey,
        model: config.gemini?.model || config.model
      })
    } else if (providerName === 'ollama') {
      provider = new OllamaProvider({
        endpoint: config.ollama?.endpoint || config.endpoint,
        model: config.ollama?.model || config.model
      })
    } else if (providerName === 'openai') {
      provider = new OpenAIProvider({
        apiKey: process.env.LUMINA_OPENAI_API_KEY || config.openai?.apiKey || config.apiKey,
        model: config.openai?.model || config.model
      })
    } else if (providerName === 'anthropic') {
      provider = new AnthropicProvider({
        apiKey: process.env.LUMINA_ANTHROPIC_API_KEY || config.anthropic?.apiKey || config.apiKey,
        model: config.anthropic?.model || config.model
      })
    }
    
    if (!provider) {
      console.log(pc.red(`  ❌ Provider "${providerName}" not supported.`))
      return
    }

    console.log(pc.white(`  Using provider: ${pc.bold(providerName)}`))

    for (const locale of targetLocales) {
      console.log(pc.yellow(`\n  Processing locale: ${pc.bold(locale)}`))
      
      const localePath = path.join(localesDir, `${locale}.json`)
      const existing = fs.existsSync(localePath) ? JSON.parse(fs.readFileSync(localePath, 'utf-8')) : {}
      
      const untranslatedKeys = keys.filter(k => !existing[k])
      
      if (untranslatedKeys.length === 0) {
        console.log(pc.green(`  ✅ All strings already translated for ${locale}`))
        continue
      }
      
      console.log(pc.white(`  Found ${untranslatedKeys.length} new strings. Translating...`))
      
      // Batch Processing (20 strings per call)
      const batchSize = 20
      const results: Record<string, string> = { ...existing }
      
      for (let i = 0; i < untranslatedKeys.length; i += batchSize) {
        const batchKeys = untranslatedKeys.slice(i, i + batchSize)
        const batchTexts = batchKeys.map(k => original[k])
        
        try {
          const translations = await provider.translate(batchTexts, locale, config.defaultLocale)
          batchKeys.forEach((key, index) => {
            results[key] = translations[index]
          })
          process.stdout.write(pc.green('.'))
        } catch (err: any) {
          console.log(pc.red(`\n  ❌ Failed to translate batch: ${err.message}`))
        }
      }
      
      fs.writeFileSync(localePath, JSON.stringify(results, null, 2))
      console.log(pc.green(`\n  ✅ Saved ${locale}.json`))
    }
    
    console.log(pc.cyan('\n  🎉 Translation complete!\n'))
  })

cli.help()
cli.parse()

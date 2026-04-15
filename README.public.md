# Lumina i18n: Zero-Config Internationalization

Lumina i18n is a next-generation internationalization tool designed to eliminate 100% of the friction and boilerplate in frontend development. It operates on the premise of **Zero Configuration** and **Framework Agnosticism**.

## 🚀 Vision: Invisible i18n

Traditional i18n processes are manual and tedious. Lumina transforms this into an automated process:
- **Write in your native language:** No JSON files to maintain.
- **AST-Based Extraction:** Our engine scans your code at build-time.
- **AI-Powered Context:** Lumina understands where your text sits (e.g., distinguishing "Check out" in a cart vs. a hotel).
- **Extreme Performance:** Lightweight runtime (< 2KB) using Signals.

## 🛠️ How it works (Developer Experience)

### 1. Mark your UI
Just add a `t` attribute to any HTML/JSX element:
```jsx
<button t>Create new account</button>
```

### 2. Mark your logic
Use the `t` literal for variables or business logic:
```typescript
const message = t('Operation successful')
```

### 3. Dynamic Interpolation
Lumina handles variables natively:
```jsx
<p t>You have {count} messages, {name}</p>
```

## 🏗️ Architecture

Lumina shifts the heavy lifting from the browser to the build process using `unplugin` (Vite, Webpack, Rollup).

1. **Extraction:** A precise Babel-based AST engine scans your source code using exact UTF-16 character indexing to safely manipulate multi-byte strings and emojis without layout shifts.
2. **Hashing:** Unique IDs are generated for each block of text based on content and file path.
3. **Local Sync:** Translations are stored locally in `.lumina/locales/`. If a language dictionary is missing, Lumina automatically generates a structural stub JSON to prevent build failures. You can use API keys (OpenAI, Anthropic, Gemini) or local models via Ollama.
4. **Runtime Injection:** During build, the compiler re-writes your code to call the lightweight Lumina client efficiently.

## 📦 Open Source Core

The core engine and local plugins are fully open source. Developers can:
- Support React, Vue, Svelte, Astro, and Vanilla JS.

## 🛠️ Getting Started

### 1. Installation
```bash
pnpm add @continuouslabs/lumina
pnpm add -D @continuouslabs/unplugin-lumina lumina-i18n
```

### 2. Initialization
Run the CLI to set up your project structure:
```bash
npx lumina-i18n init
```
This creates `lumina.config.json` and the `.lumina/locales` directory.

### 3. Build & Extract
Add the plugin to your `vite.config.ts`:
```typescript
import { vitePlugin as lumina } from '@continuouslabs/unplugin-lumina'

export default {
  plugins: [lumina()]
}
```
Run your build command to extract keys into `original.json`.

### 4. AI Translation
Translate your keys automatically:
```bash
# Using OpenAI (Cloud)
export LUMINA_OPENAI_API_KEY=your_key
npx lumina-i18n translate --provider openai

# Using Anthropic (Cloud)
export LUMINA_ANTHROPIC_API_KEY=your_key
npx lumina-i18n translate --provider anthropic

# Using Gemini (Cloud)
export LUMINA_GEMINI_API_KEY=your_key
npx lumina-i18n translate --provider gemini

# Using Ollama (Local)
npx lumina-i18n translate --provider ollama
```

## ⚙️ Configuration

Lumina uses a `lumina.config.json` file at the root of your project. Here is the complete schema:

```json
{
  "defaultLocale": "en",
  "locales": ["en", "es", "fr"],
  "outputDir": "./.lumina/locales",
  "provider": "gemini", 
  "model": "gemini-1.5-flash",
  "endpoint": "http://localhost:11434/api/generate"
}
```

### Options Reference:
- **`defaultLocale`**: The language you write your code in.
- **`locales`**: Array of target languages for translation.
- **`outputDir`**: Where the JSON dictionaries will be stored.
- **`provider`**: AI engine to use (`openai`, `anthropic`, `gemini`, or `ollama`).
- **`model`**: (Optional) Specific model ID for the provider.
- **`endpoint`**: (Optional) Required for `ollama` local setup.

> [!TIP]
> **API Keys:** For security, it is highly recommended to use environment variables instead of hardcoding keys in the config file. Lumina automatically looks for `LUMINA_OPENAI_API_KEY`, `LUMINA_ANTHROPIC_API_KEY`, or `LUMINA_GEMINI_API_KEY`.

## 🎨 Showcase Demos

Explore Lumina in action with our premium framework-specific examples:
- **[React Demo](./examples/react-demo)**
- **[Vue Demo](./examples/vue-demo)**
- **[Astro Demo](./examples/astro-demo)**

Each demo features:
- **Zero-Config Logic:** No manual key mapping.
- **Interactive Switcher:** Real-time language updates.
- **Modern Design:** Dark mode, glassmorphism, and smooth transitions.

## 🛤️ Roadmap & Future

Lumina is rapidly evolving. Here's what's coming:
- **Enhanced SSR Support:** First-class integration for Next.js, Nuxt, and SvelteKit.
- **Enterprise Collaboration:** Tools for team-based translation management.
- **Lumina Edge (Coming Soon):** Managed global hosting for your translations with <50ms latency.

---
*Developed with ❤️ for the Developer Experience.*

# Lumina CLI

> The AI-powered command-line interface for Lumina i18n.

The Lumina CLI is your partner in automating the internationalization workflow. From project initialization to full dictionary translation using state-of-the-art AI, the CLI removes the manual labor from i18n.

## 💎 Features

- **Instant Init**: Set up your locales and config in one command.
- **AI Translation**: High-context translations using Google Gemini, OpenAI, Claude, or Ollama.
- **Incremental Sync**: Only translate new strings to save costs and time.

## 🚀 Installation

```bash
pnpm add -g @continuouslabs/lumina-cli
```

## 📖 Commands

### `lumina init`
Initializes a new Lumina project by creating the `lumina.config.json` and the `.lumina/locales` directory.

### `lumina translate`
Translates all keys extracted during the build (found in `original.json`) into your target locales.

```bash
# Using Google Gemini (Default)
LUMINA_GEMINI_API_KEY=xxx lumina translate

# Using Anthropic Claude
LUMINA_ANTHROPIC_API_KEY=xxx lumina translate --provider anthropic
```

## ⚙️ Configuration

You can configure your providers directly in `lumina.config.json`:

```json
{
  "defaultLocale": "en",
  "locales": ["en", "es", "fr"],
  "provider": "gemini",
  "gemini": {
    "model": "gemini-1.5-pro"
  }
}
```

---

<p align="center">
  Developed with focus by <b>Continuous Labs</b>
</p>

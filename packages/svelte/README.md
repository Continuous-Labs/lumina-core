# @continuouslabs/lumina-svelte

The official Svelte adapter for **Lumina i18n**.

This package provides a seamless, reactive bridge between Lumina's Signals-based core and Svelte's reactivity system. It is optimized for **Svelte 5 Runes**.

## 🚀 Quick Start

### 1. Installation

```bash
pnpm add @continuouslabs/lumina-svelte @continuouslabs/lumina
```

### 2. Implementation

Initialize Lumina in your root component:

```svelte
<script lang="ts">
  import { createLumina } from '@continuouslabs/lumina-svelte'

  // Initialize and provide context to children
  const lumina = createLumina({
    locale: 'en'
  })
</script>

<main>
  <h1 t>Hello World</h1>
  <button onclick={() => lumina.setLocale('es')}>
    Switch to Spanish
  </button>
</main>
```

### 3. Usage in Child Components

```svelte
<script lang="ts">
  import { useLumina } from '@continuouslabs/lumina-svelte'

  const { locale } = useLumina()
</script>

<p>Current Locale: {locale}</p>
```

## 🪄 Zero-Config Mode

If you are using `@continuouslabs/unplugin-lumina`, you don't even need manual `t()` calls. Just add the `t` attribute to any HTML tag, and our compiler will handle the rest.

## 🤝 Support

Part of the **Lumina i18n** ecosystem.
Maintained by [Continuous Labs](https://clabs.tech).

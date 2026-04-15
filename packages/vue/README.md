# @continuouslabs/lumina-vue

> Vue 3 adapter for the Lumina i18n ecosystem.

Lumina Vue provides a seamless integration for Vue 3 applications, supporting both Composition API and Standard Templates with full reactivity.

## 💎 Features

- **Vue Plugin**: Simple `app.use(Lumina)` initialization.
- **SFC Optimized**: Designed specifically for `.vue` Single File Components.
- **Reactive Hooks**: Clean standard `useLumina` hook.
- **Directives Support**: Automatic attribute-based translation.

## 🚀 Installation

```bash
pnpm add @continuouslabs/lumina @continuouslabs/lumina-vue
```

## 📖 Usage

### 1. Register the Plugin

```typescript
import { createApp } from 'vue'
import { createLumina } from '@continuouslabs/lumina-vue'
import App from './App.vue'

const app = createApp(App)

// In Zero-Config mode, createLumina() picks up dev/prod config automatically
app.use(createLumina())
app.mount('#app')
```

### 2. Component Usage

```vue
<script setup>
import { useLumina } from '@continuouslabs/lumina-vue'

const { currentLocale, setLocale } = useLumina()
</script>

<template>
  <div>
    <!-- The 't' attribute trigger extraction and translation -->
    <h1 t>Hello from Vue</h1>
    
    <button @click="setLocale('es')">Switch to Spanish</button>
  </div>
</template>
```

---

<p align="center">
  Developed with focus by <b>Continuous Labs</b>
</p>

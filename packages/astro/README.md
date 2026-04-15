# @continuouslabs/lumina-astro

> Astro adapter for the Lumina i18n ecosystem.

Lumina Astro brings high-performance, island-aware internationalization to the Astro framework, ensuring fast static builds and lightweight dynamic islands.

## 💎 Features

- **Server-First**: Optimized for Astro's server-side rendering and static generation.
- **Island Friendly**: Seamlessly shares locale state between the server and any framework islands (React, Vue, etc.).
- **Markdown Aware**: Supports attribute-based extraction in `.astro` files.

## 🚀 Installation

```bash
pnpm add @continuouslabs/lumina @continuouslabs/lumina-astro
```

## 📖 Usage

### 1. Initialize in Frontmatter

In your layout or page:

```astro
---
import { initLumina } from '@continuouslabs/lumina-astro'

// Zero-Config auto-initialization
initLumina()
---

<html>
  <body>
    <h1 t>Lumina Love for Astro</h1>
    <slot />
  </body>
</html>
```

### 2. Zero-Config Extraction

Lumina automatically scans your `.astro` files for the `t` attribute. During the build phase, it extracts these strings and prepares them for AI-powered translation.

---

<p align="center">
  Developed with focus by <b>Continuous Labs</b>
</p>

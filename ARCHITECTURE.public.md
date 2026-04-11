# Lumina i18n: Engineering Architecture (Public)

This document describes the technical implementation of Lumina i18n, focused on the **Build-Time Engine** and **Runtime Client**.

## 1. Compiler Architecture (Build Time)

Lumina utilizes **`unplugin`** to provide a universal compiler experience across Vite, Webpack, Rollup, and esbuild.

### A. The Extraction Engine
- **Parser:** A Rust-based engine (SWC) scans the source code's Abstract Syntax Tree (AST).
- **Targeting:** It identifies specific nodes:
    - Elements with the `t` or `i18n` attribute.
    - Tagged template literals using `t()`.
- **Contextual Hashing:** Genera a hash (e.g., `id_7a8b`) based on:
    1. The raw text content.
    2. The relative file path (providing context to the LLM).

### B. Code Mutation
Before the code reaches the framework's bundler, Lumina re-writes the file in memory:
- **Input (JSX):** `<button t>Save</button>`
- **Output:** `<button>{__lumina.getText('id_7a8b', 'Save')}</button>`

This ensures that the final bundle contains only the optimized calls to the runtime library.

---

## 2. Runtime Architecture (Client Side)

The client SDK is designed for zero impact on bundle size and performance.

- **Payload:** < 2KB (min+gz).
- **Reactive Engine:** Built on **Signals (Vanilla JS)** for framework-agnostic reactivity.
- **Localized Updates:** When a language change occurs (`Lumina.setLanguage('es')`), the signals-based state triggers a re-render of only the affected text nodes, avoiding a full page or component reload.
- **Lazy Loading:** Localization dictionaries are loaded asynchronously only when needed.

---

3. **Commit:** The resulting JSON dictionaries are committed to the repository, ensuring zero runtime dependencies on external APIs for basic usage.

---

## 4. Multi-Provider AI Engine

Lumina's translation layer is designed to be provider-agnostic, supporting a wide range of AI backends:
- **Cloud Providers:** Native support for Google Gemini (via `gemini-1.5-flash`) and OpenAI.
- **Local Providers:** Full support for **Ollama**, enabling private, local-first translation workflows with models like `llama3`.
- **Batching & Context:** The engine automatically batches translation requests and injects file-system path context to help the LLM provide more accurate, context-aware translations.

---

## 5. Testing Strategy

Stability is guaranteed through a specialized testing suite powered by **Vitest**:
- **Unit Testing:** Validates core hashing stability and signals reactivity.
- **Integration Testing:** Mocks AI provider APIs to verify correctly merged translation files without incurring costs.
- **Invariant Checking:** Ensuring that dynamic placeholders ({0}, {1}) are never corrupted during the translation phase.

---

## 6. Package Ecosystem

Lumina is managed as a monorepo containing several core packages:

- `@continuouslabs/lumina`: Hashing logic and Signals runtime.
- `@continuouslabs/unplugin-lumina`: The unified build-time plugin.
- `lumina-i18n`: Command-line tool for initialization and extraction.
- Framework Adapters: Specialized wrappers for `@continuouslabs/lumina-react`, `@continuouslabs/lumina-vue`, and `@continuouslabs/lumina-astro`.

---
*Developed with ❤️ for the Developer Experience.*

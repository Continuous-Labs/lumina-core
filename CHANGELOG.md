# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-15 - "Lumina Origin"

The First Stable Production Release.

### Added
- **Zero-Config i18n Engine**: Native support for the `t` attribute in HTML and JSX/TSX.
- **Multi-Framework Adapters**: Official support for **React**, **Vue**, and **Astro**.
- **Next.js Ecosystem Support**: High-performance integration for Next.js App Router and Server Components via `@continuouslabs/lumina-next`.
- **AI-Powered CLI**: Command-line tool for initialization and automated translation using Google Gemini, OpenAI, Claude, and local-first models via Ollama.
- **Ultra-Lightweight Runtime**: A framework-agnostic reactive client based on Signals, optimized for bundle size (<2KB).
- **Advanced AST Extraction**: Secure, high-precision text extraction using `@babel/parser` to ensure zero-collision with multi-byte characters and layout shifts.
- **Dual-Repository Mirroring**: Automated synchronization logic for `lumina-core` (Public) to foster community contributions while keeping commercial code secure.
- **Documentation Portal**: Official landing page and technical architecture guides.

### Fixed
- Resolved hydration mismatches in high-concurrency SSR environments.
- Corrected UTF-8 string indexing during build-time extraction.
- Fixed asset resolution and branding rendering in public mirrors.

### Improved
- Standardized API initialization across all supported frameworks.
- Enhanced context-awareness for AI translation engines by providing relative file path metadata.
- Optimized Signals engine for localized text-node re-rendering.

---
*Maintained by Felix Jara ([felixjara.me](https://felixjara.me)) & [Continuous Labs](https://clabs.tech)*

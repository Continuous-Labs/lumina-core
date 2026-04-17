# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-04-17

### Added
- **Official Svelte 5 Adapter**: Native integration for Svelte 5 using Runes ($state) for high-performance reactive localization.
- **Svelte Compiler Support**: Updated `@continuouslabs/unplugin-lumina` to handle `.svelte` files, including script/template extraction and single-brace expression generation.
- **Svelte Documentation**: New integration guides and installation steps added to the documentation portal.
- **Svelte Showcase**: Added Svelte 5 to the framework showcase on the official homepage.
- **AI Agent Onboarding**: Introduced `GEMINI.md` to provide immediate context and surgical navigation for AI coding assistants.

### Fixed
- **Unplugin Syntax Parity**: Refined the expression engine to support single-brace `{}` syntax for Svelte/Astro while maintaining double-brace `{{}}` for Vue.
- **Package ESM Support**: Native ESM support for Svelte packages to resolve module collision issues in modern environments.

## [1.2.2] - 2026-04-17

### Fixed
- **Monorepo Build Stabilization**: Pinned TypeScript to `~5.7.3` monorepo-wide to resolve `NgCompiler` and AnalogJS compilation incompatibilities found in newer versions.
- **Angular Demo Resolution**: Restored AnalogJS/Vite 6 production build support by providing a standard server entry point and stabilizing the Rollup build configuration.
- **Localization Parity**: Completed full Spanish translation sync for the documentation portal and examples.
- **Repository Integrity**: Restored core CLI binaries and internal architecture manifests accidentally removed during workspace maintenance.

## [1.2.1] - 2026-04-16

### Fixed
- **Critical Build Stabilization**: Refined the `unplugin-lumina` Regex engine to prevent false positives in HTML attribute matching (e.g., correctly distinguishing between the `t` attribute and CSS classes like `text-white`).
- **Gemini API Key Format Support**: Added support for newer Google AI Studio keys starting with the `AQ.` prefix.
- **Enhanced API Security**: Transitioned the Gemini translation provider to use secure HTTP headers (`x-goog-api-key`) instead of URL query parameters for authentication.

## [1.2.0] - 2026-04-16

### Added
- **Official Angular 19+ Adapter**: High-performance integration utilizing Angular Signals for reactive localization.
- **Enhanced Compiler Support**: Updated `@continuouslabs/unplugin-lumina` to handle Angular `.html` templates and inline `.ts` component templates.
- **Babel Decorator Support**: The unplugin now correctly parses Angular metadata decorators without interruption.
- **Universal Framework Showcase**: Redesigned homepage section highlighting compatibility across React, Next.js, Vue, Astro, Angular, and Vanilla JS.
- **Angular Documentation**: Comprehensive guides for Signals-based i18n added to the official documentation portal.

## [1.1.0] - 2026-04-16

## [1.0.9] - 2026-04-15

### Fixed
- Improved technical accuracy of terminal commands in the documentation.

## [1.0.8] - 2026-04-15

### Changed
- Final documentation cleanup and Polish.

## [1.0.7] - 2026-04-15

### Changed
- **CLI Renaming**: Renamed the initialization package to `@continuouslabs/lumina-cli` for better ecosystem consistency.

## [1.0.6] - 2026-04-15

### Changed
- Routine version maintenance.

## [1.0.5] - 2026-04-15

### Fixed
- Optimized refspec usage (`HEAD:main`) for more robust public synchronization.

## [1.0.4] - 2026-04-15

### Fixed
- Resolved CI synchronization errors during edge case monorepo updates.

## [1.0.3] - 2026-04-15

### Added
- Automated synchronization logic for the public `lumina-core` repository.

## [1.0.2] - 2026-04-15

### Changed
- Site branding refinement: Updated favicon to PNG format for higher compatibility.

## [1.0.1] - 2026-04-15

### Added
- Premium brand elements and Obsidian Liquid icons.
- Advanced SEO metadata and GTM analytics integration.
- Deployment-ready `llms.txt` for AI discovery.

### Fixed
- Corrected NPM authentication in the production release workflow.

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

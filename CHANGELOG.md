# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-04-16

### Added
- **Browser Language Auto-Detection**: Core engine now automatically identifies and sets user language based on browser preferences if `autoDetect: true` is enabled.
- **Expanded Documentation**: Updated root, public, and example READMEs to document the new configuration options.
- **Website Update**: Added technical documentation for the `autoDetect` feature to the official portal.

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

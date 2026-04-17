/**
 * Lumina Angular Adapter
 * 
 * Official Angular 19+ integration for Lumina i18n.
 * Powered by Signals and Zero-Config AST extraction.
 */

export * from './lib/lumina.service'
export * from './lib/lumina.directive'
export * from './lib/lumina.pipe'
export * from './lib/provider'

// Re-export core types for convenience
export type { LuminaOptions, LuminaClient } from '@continuouslabs/lumina'

/**
 * Lumina React Adapter
 * 
 * This package provides the official React integration for Lumina i18n.
 * It uses React Context to distribute the Lumina client and a custom hook 
 * that bridges Lumina's Signals to React's state system for seamless updates.
 */

'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { LuminaClient, initLumina, LuminaOptions } from '@continuouslabs/lumina'

/**
 * Internal context to share the Lumina instance across the component tree.
 */
const LuminaContext = createContext<LuminaClient | null>(null)

export interface LuminaProviderProps {
  /** 
   * Custom initialization options. 
   * In Zero-Config mode, this is automatically injected by the compiler.
   */
  options?: LuminaOptions
  children: ReactNode
}

/**
 * The root component for any Lumina-powered React application.
 * 
 * It initializes the core Lumina client and ensures a singleton instance 
 * is available globally for the compiler-generated code to work.
 */
export const LuminaProvider: React.FC<LuminaProviderProps> = ({ children, options }) => {
  const [client] = useState(() => {
    // We initialize the client once per application lifecycle
    const c = initLumina(options)
    
    // We attach it to globalThis so the ' getText' calls generated 
    // by the unplugin can find it without manual imports.
    if (typeof globalThis !== 'undefined') {
      (globalThis as any).__lumina = c
    }
    return c
  })

  return (
    <LuminaContext.Provider value={client}>
      {children}
    </LuminaContext.Provider>
  )
}

/**
 * The primary hook to interact with translations in React.
 * 
 * Why this hook? While the compiler handles static text automatically, 
 * you sometimes need to change the language manually (e.g., a language switcher) 
 * or access the current locale.
 * 
 * This hook handles the heavy lifting of subscribing to language changes 
 * and forcing a re-render when the locale is updated.
 */
export const useLumina = () => {
  const contextClient = useContext(LuminaContext)

  if (!contextClient) {
    throw new Error('useLumina must be used within a LuminaProvider')
  }

  /**
   * Helper to retrieve the canonical client.
   * 
   * We prefer the global singleton (globalThis.__lumina) because it's the 
   * source of truth for the compiler, but we fall back to context for 
   * better testability and isolation.
   */
  const getClient = useCallback((): LuminaClient => {
    return ((globalThis as any).__lumina as LuminaClient) ?? contextClient
  }, [contextClient])

  // We mirror the locale in local state to trigger React's reconciliation
  const [locale, setLocaleState] = useState<string>(() => getClient().locale)

  useEffect(() => {
    const client = getClient()

    // Sync state immediately on mount
    setLocaleState(client.locale)

    // Subscribe to the Lumina Signal.
    // When client.locale = 'es' is called anywhere, this listener fires.
    const unsubscribe = client.subscribe(() => {
      setLocaleState(client.locale)
    })

    return unsubscribe // Cleanup on unmount
  }, [getClient])

  /**
   * Updates the application language.
   * This is a reactive operation that will update all 't' attributes instantly.
   */
  const setLocale = useCallback((newLocale: string) => {
    const client = getClient()
    // 1. Update the core Signal (this notifies all subscribers, including other hooks)
    client.locale = newLocale
    // 2. Update local state for immediate synchronous feedback
    setLocaleState(newLocale)
  }, [getClient])

  return {
    /** The raw Lumina instance for advanced usage */
    client: getClient(),
    /** Read-only current locale string (e.g., 'en', 'es') */
    locale,
    /** Function to switch the language globally */
    setLocale,
  }
}

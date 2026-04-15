'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { LuminaClient, initLumina, LuminaOptions } from '@continuouslabs/lumina'

const LuminaContext = createContext<LuminaClient | null>(null)

export interface LuminaProviderProps {
  options?: LuminaOptions
  children: ReactNode
}

export const LuminaProvider: React.FC<LuminaProviderProps> = ({ children, options }) => {
  const [client] = useState(() => {
    const c = initLumina(options || { locale: 'en', defaultLocale: 'en', messages: {} })
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

export const useLumina = () => {
  const contextClient = useContext(LuminaContext)

  if (!contextClient) {
    throw new Error('useLumina must be used within a LuminaProvider')
  }

  // Use the global singleton as canonical source, fall back to context
  const getClient = useCallback((): LuminaClient => {
    return ((globalThis as any).__lumina as LuminaClient) ?? contextClient
  }, [contextClient])

  // Force re-render by storing locale in state
  const [locale, setLocaleState] = useState<string>(() => getClient().locale)

  useEffect(() => {
    const client = getClient()

    // Sync on mount in case locale changed between render and effect
    setLocaleState(client.locale)

    // Subscribe to future signal changes
    const unsubscribe = client.subscribe(() => {
      setLocaleState(client.locale)
    })

    return unsubscribe
  }, [getClient])

  const setLocale = useCallback((newLocale: string) => {
    const client = getClient()
    // Update the signal (fires subscriber → setLocaleState)
    client.locale = newLocale
    // Also update state directly for immediate synchronous feedback
    setLocaleState(newLocale)
  }, [getClient])

  return {
    client: getClient(),
    locale,
    setLocale,
  }
}

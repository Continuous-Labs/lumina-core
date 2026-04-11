import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { LuminaClient, initLumina, createEffect, LuminaOptions } from '@continuouslabs/lumina'

const LuminaContext = createContext<LuminaClient | null>(null)

export interface LuminaProviderProps extends LuminaOptions {
  children: ReactNode
}

/**
 * LuminaProvider initializes the global client and ensures reactivity
 * within the React component tree.
 */
export const LuminaProvider: React.FC<LuminaProviderProps> = ({ children, ...options }) => {
  const [client] = useState(() => {
    const instance = initLumina(options)
    // Automatic global injection for Zero Config compiler support
    if (typeof window !== 'undefined') {
      (window as any).__lumina = instance
    }
    return instance
  })

  return (
    <LuminaContext.Provider value={client}>
      {children}
    </LuminaContext.Provider>
  )
}

/**
 * Hook to access the Lumina client and subscribe to locale changes.
 */
export const useLumina = () => {
  const client = useContext(LuminaContext)
  if (!client) {
    throw new Error('useLumina must be used within a LuminaProvider')
  }

  // Bridging Core Signal to React State
  const [locale, setLocale] = useState(client.locale)

  useEffect(() => {
    // createEffect from core will track dependencies and trigger this callback
    createEffect(() => {
      setLocale(client.locale)
    })
  }, [client])

  return {
    client,
    locale,
    setLocale: (newLocale: string) => {
      client.locale = newLocale
    }
  }
}

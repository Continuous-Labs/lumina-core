'use client'

import { useState, useEffect } from 'react'
import { initLumina, lumina } from '@continuouslabs/lumina'

export { initLumina, lumina }
export * from '@continuouslabs/lumina'

export function useLumina() {
  const [locale, setLocale] = useState(lumina?.locale || 'en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!lumina) return
    
    // Subscribe to locale changes
    const unsubscribe = lumina.subscribe(() => {
      setLocale(lumina.locale)
    })
    
    return () => unsubscribe?.()
  }, [])

  return { locale, lumina, mounted }
}

import React from 'react'
import { LuminaProvider, useLumina } from '@continuouslabs/lumina-react'
import esMessages from '../.lumina/locales/es.json'

/**
 * Lumina Demo Application
 * This showcase demonstrates zero-config i18n with premium UI.
 */
function Dashboard() {
  const { locale, setLocale } = useLumina()
  const name = 'Felix'

  return (
    <div className="card">
      <div className="badge" t>Premium Experience</div>
      
      {/* 
        Note: The 't' attribute is detected by the SWC compiler 
        and replaced with reactive signals. No manual translations needed!
      */}
      <h1 t>Internationalization has never been this easy.</h1>
      
      {/* Interpolation is handled naturally */}
      <p t>Welcome back to your workspace, {name}. Lumina detected your environment and loaded the perfect locale for you.</p>
      
      <div className="controls">
        <button onClick={() => setLocale('en')} className={locale === 'en' ? '' : 'secondary'}>
          English
        </button>
        <button onClick={() => setLocale('es')} className={locale === 'es' ? '' : 'secondary'}>
          Español
        </button>
      </div>
      
      <div style={{ marginTop: '2rem', opacity: 0.5, fontSize: '0.9rem' }}>
        <span t>Current Locale:</span> {locale}
      </div>
    </div>
  )
}

function App() {
  return (
    <LuminaProvider 
      options={{ 
        locale: 'en',
        messages: {
          es: esMessages
        }
      }}
    >
      <Dashboard />
    </LuminaProvider>
  )
}

export default App

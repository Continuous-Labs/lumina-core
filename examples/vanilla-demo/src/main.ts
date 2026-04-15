import { initLumina } from '@continuouslabs/lumina'

// Zero-Config: The unplugin now handles configuration injection automatically!
const client = initLumina()

// Since Vanilla JS doesn't have a VDOM/Reactivity engine by default,
// We manually trigger re-renders from the compiled runtime calls.
const btnEn = document.getElementById('btn-en')
const btnEs = document.getElementById('btn-es')

// The Lumina compiler turns <h1 t> into `<h1>${__lumina?.getText(...)}</h1>`
// Wait, actually the compiler works on src files, not index.html directly!
// So let's inject our HTML via main.ts so the compiler sees it.

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1 t>Hello from Continuous Labs</h1>
    <p t>This is a completely Vanilla Javascript integration of Lumina.</p>
    <div style="margin-top: 2rem;">
      <button id="btn-en">English</button>
      <button id="btn-es">Español</button>
    </div>
  </div>
`

// For a pure vanilla environment, language changes require a re-render
const render = () => {
  // Re-evaluating the template literal invokes lumina.getText() dynamically!
  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <div>
      <h1 t>Hello from Continuous Labs</h1>
      <p t>This is a completely Vanilla Javascript integration of Lumina.</p>
      <div style="margin-top: 2rem;">
        <button id="btn-en" ${client.locale === 'en' ? 'disabled' : ''}>English</button>
        <button id="btn-es" ${client.locale === 'es' ? 'disabled' : ''}>Español</button>
      </div>
    </div>
  `
  
  document.getElementById('btn-en')?.addEventListener('click', () => {
    client.locale = 'en'
    render()
  })
  
  document.getElementById('btn-es')?.addEventListener('click', () => {
    client.locale = 'es'
    render()
  })
}

// Global injection so compiled literals inside render() find it
if (typeof window !== 'undefined') {
  (window as any).__lumina = client
}

render()

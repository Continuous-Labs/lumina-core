<script lang="ts">
  import { createLumina } from '@continuouslabs/lumina-svelte'

  // Initialize Lumina in the root component
  const lumina = createLumina({
    locale: 'en'
  })

  function toggleLanguage() {
    lumina.setLocale(lumina.locale === 'en' ? 'es' : 'en')
  }
</script>

<main>
  <h1 t>Lumina i18n + Svelte 5</h1>
  
  <p t>Este es un ejemplo de traducción automática con el atributo t en Svelte.</p>
  
  <div class="card">
    <button onclick={toggleLanguage}>
      <span t>Cambiar idioma</span> (Current: {lumina.locale})
    </button>
  </div>

  <footer>
    <p t>Potenciado por el motor Invisible i18n.</p>
  </footer>
</main>

<style>
  main {
    text-align: center;
    padding: 2em;
    max-width: 800px;
    margin: 0 auto;
    font-family: sans-serif;
  }

  .card {
    background: #f9f9f9;
    padding: 2em;
    border-radius: 8px;
    margin: 2em 0;
    border: 1px solid #eee;
  }

  button {
    background: #ff3e00;
    color: white;
    border: none;
    padding: 0.8em 1.5em;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1em;
    font-weight: bold;
  }

  button:hover {
    background: #ff5722;
  }
</style>

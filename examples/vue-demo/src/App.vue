<script setup lang="ts">
import { useLumina } from '@continuouslabs/lumina-vue'

/**
 * Lumina Vue Demo
 * Showcasing Composition API integration with zero-config i18n.
 */
const { locale, setLocale } = useLumina()
const name = 'Felix'
</script>

<template>
  <div class="card">
    <div class="badge" t>Vue + Lumina</div>
    
    <!-- 
      The 't' attribute works exactly the same in Vue templates! 
      The SWC compiler transforms this into a reactive getText call.
    -->
    <h1 t>Build multilingual apps in seconds, not hours.</h1>
    
    <p t>Hey {name}, welcome to the Vue demo. Change the language below and watch the reactivity in action.</p>
    
    <div class="controls">
      <button 
        @click="setLocale('en')" 
        :class="{ secondary: locale !== 'en' }"
      >
        English
      </button>
      <button 
        @click="setLocale('es')" 
        :class="{ secondary: locale !== 'es' }"
      >
        Español
      </button>
    </div>
    
    <div style="margin-top: 2rem; opacity: 0.5; font-size: 0.9rem">
      <span t>Selected Locale:</span> {{ locale }}
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles can be added here, but we use the global index.css for the premium look */
</style>

import './index.css'
import App from './App.vue'
import lumina from '@continuouslabs/lumina-vue'
import esMessages from '../.lumina/locales/es.json'

const app = createApp(App)

// Initialize Lumina Vue Plugin
app.use(lumina, {
  locale: 'en',
  messages: {
    es: esMessages
  }
})

app.mount('#root')

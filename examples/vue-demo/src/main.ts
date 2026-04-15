import { createApp } from 'vue'
import './index.css'
import App from './App.vue'
import { createLumina } from '@continuouslabs/lumina-vue'
const app = createApp(App)

// Initialize Lumina Vue Plugin
app.use(createLumina())

app.mount('#root')

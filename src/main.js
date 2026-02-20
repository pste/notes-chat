import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index.js'
import App from './App.vue'
import './style.css'

// Initialize dark mode from localStorage
const savedTheme = localStorage.getItem('theme')
const isDarkMode = savedTheme === 'dark'
if (isDarkMode) {
  document.documentElement.classList.add('dark')
}

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './routers/index.js'

import './assets/main.css' // Наш Tailwind

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

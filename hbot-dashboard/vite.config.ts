// vite.config.js
import { defineConfig } from 'vite'

//Esto permite que se puedan ejecutar las apis directamente, sin agregar cors en el backend
export default defineConfig({
  server: {
    proxy: {
      '/robots': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})

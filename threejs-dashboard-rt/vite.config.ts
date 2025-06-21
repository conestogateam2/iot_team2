// vite.config.js
import { defineConfig } from 'vite'

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

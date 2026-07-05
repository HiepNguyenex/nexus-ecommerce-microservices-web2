import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5500,
    proxy: {
      '/api': {
        target: 'http://localhost:8900',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})

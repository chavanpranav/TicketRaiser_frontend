import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://ticketraiser.onrender.com',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'https://ticketraiser.onrender.com',
        changeOrigin: true,
      },
    },
  },
})

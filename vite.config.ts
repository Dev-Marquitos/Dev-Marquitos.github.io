import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: './', // rutas relativas: funciona en GitHub Pages con cualquier nombre de repositorio
  build: {
    chunkSizeWarningLimit: 1500,
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' deixa o site funcionar em qualquer endereço do GitHub Pages (usuario.github.io/nome-do-repositorio/).
export default defineConfig({
  base: './',
  plugins: [react()],
})

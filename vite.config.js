import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves project repos from /<repo>/; the deploy workflow sets this.
  base: process.env.BASE_PATH || '/',
})

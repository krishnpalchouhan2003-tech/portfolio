import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // let the Cloudflare quick tunnel reach the dev server for phone testing
  server: { allowedHosts: ['.trycloudflare.com'] },
})

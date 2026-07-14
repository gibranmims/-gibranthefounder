import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5177,
    proxy: {
      '/api/claude': 'http://localhost:3009',
    },
    // dev port 5177 — 5173/5174/5175/5176/5188 already used by sibling projects
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    host: '0.0.0.0',
    allowedHosts: ['d2eaqgx1vid8no.cloudfront.net'],
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
    },
    proxy: {
      '/api': 'http://localhost:5001',
    },
  },
})

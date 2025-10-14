import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: '0.0.0.0',
      watch: {
        usePolling: true, // Necessário para Docker no Windows
        interval: 1000,   // Verifica mudanças a cada 1 segundo
      },
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://backend:8080',
          changeOrigin: true
        }
      }
    }
  }
})


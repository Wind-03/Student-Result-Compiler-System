import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Where the NestJS backend is running during local development.
  const backend = env.VITE_API_PROXY_TARGET || 'http://localhost:3000'

  return {
    plugins: [react()],
    server: {
      // Proxy /api -> backend so the app can use a relative baseURL ('/api')
      // with no CORS setup. Requests to /api/auth/login hit
      // <backend>/api/auth/login.
      proxy: {
        '/api': {
          target: backend,
          changeOrigin: true,
        },
      },
    },
  }
})

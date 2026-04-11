import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

const appDir = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, appDir, '')
  const apiPort =
    env.VITE_API_PORT?.trim() ||
    env.VITE_BACKEND_PORT?.trim() ||
    '8080'
  const apiHost = env.VITE_API_HOST?.trim() || '127.0.0.1'

  return {
    plugins: [vue()],
    base: '/',
    server: {
      proxy: {
        '/api': {
          target: `http://${apiHost}:${apiPort}`,
          changeOrigin: true,
        },
      },
    },
  }
})

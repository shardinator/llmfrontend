import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

const appDir = path.dirname(fileURLToPath(import.meta.url))

function trim(s: string | undefined): string {
  return s?.trim() ?? ''
}

/** Origin for `server.proxy['/api'].target` — reads env only in Node, not bundled for the client. */
function resolveBackendProxyTarget(env: Record<string, string>): string {
  const fromUrl = trim(env.BACKEND_URL) || trim(env.VITE_API_BASE)
  if (fromUrl) {
    try {
      const u = new URL(fromUrl.replace(/\/$/, ''))
      return u.origin
    } catch {
      /* fall through */
    }
  }

  const host =
    trim(env.VITE_API_HOST) || trim(env.BACKEND_HOST) || '127.0.0.1'
  const port =
    trim(env.VITE_API_PORT) ||
    trim(env.VITE_BACKEND_PORT) ||
    trim(env.BACKEND_PORT) ||
    trim(env.PORT) ||
    '8080'

  return `http://${host}:${port}`
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, appDir, '')
  const apiTarget = resolveBackendProxyTarget(env)

  return {
    envPrefix: ['VITE_', 'BACKEND_'],
    plugins: [vue()],
    base: '/',
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  }
})

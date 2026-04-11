/**
 * API origin for fetch(). Inlined at build time from env vars.
 *
 * Resolution:
 * 1. `VITE_API_BASE` — full origin (e.g. `https://my-api.fly.dev`).
 * 2. Else `BACKEND_URL` in **production** only (e.g. set on Vercel; same value as local proxy target).
 *    Ignored in `vite dev` so `/api` still uses the dev proxy.
 * 3. Else `VITE_API_PROTOCOL` + `VITE_API_HOST` + `VITE_API_PORT` (port optional if 80/443 implied).
 * 4. Else `''` — dev: relative `/api` + Vite proxy; prod without base warns once.
 */
export function getApiBase(): string {
  const trim = (s: string | undefined) => s?.trim() ?? ''

  const viteBase = trim(import.meta.env.VITE_API_BASE)
  if (viteBase) {
    return viteBase.replace(/\/$/, '')
  }

  const backendUrl = trim(import.meta.env.BACKEND_URL)
  if (backendUrl && import.meta.env.PROD) {
    return backendUrl.replace(/\/$/, '')
  }

  const host = trim(import.meta.env.VITE_API_HOST)
  const port = trim(import.meta.env.VITE_API_PORT)
  const proto = trim(import.meta.env.VITE_API_PROTOCOL) || 'http'

  if (host) {
    if (port) {
      return `${proto}://${host}:${port}`.replace(/\/$/, '')
    }
    return `${proto}://${host}`.replace(/\/$/, '')
  }

  if (import.meta.env.PROD) {
    console.warn(
      '[llmfrontend] No API origin set (VITE_API_BASE, BACKEND_URL, or VITE_API_HOST); /api calls hit this host and will fail.',
    )
  }

  return ''
}

export function apiUrl(path: string): string {
  const base = getApiBase()
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

/**
 * API origin for fetch(). Used on Vercel via `VITE_*` build-time env vars.
 *
 * Resolution:
 * 1. `VITE_API_BASE` — full origin (e.g. `https://my-api.fly.dev`). Preferred on Vercel.
 * 2. Else `VITE_API_PROTOCOL` + `VITE_API_HOST` + `VITE_API_PORT` (port optional if 80/443 implied).
 * 3. Else `''` — dev uses relative `/api` + Vite proxy; production without base warns once.
 */
export function getApiBase(): string {
  const trim = (s: string | undefined) => s?.trim() ?? ''

  const explicit = trim(import.meta.env.VITE_API_BASE)
  if (explicit) {
    return explicit.replace(/\/$/, '')
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
      '[llmfrontend] No VITE_API_BASE (or VITE_API_HOST) set; /api calls go to the same origin and will fail unless you proxy there.',
    )
  }

  return ''
}

export function apiUrl(path: string): string {
  const base = getApiBase()
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

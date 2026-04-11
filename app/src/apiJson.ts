/**
 * Parse JSON from a fetch Response with clearer errors when the body is empty,
 * HTML (e.g. SPA index from Vercel), or otherwise not JSON.
 */
export async function parseApiResponseJson<T>(
  res: Response,
  requestUrl: string,
): Promise<T> {
  const text = await res.text()
  const t = text.trim()

  const prodHint =
    import.meta.env.PROD
      ? ' In Vercel, set BACKEND_URL or VITE_API_BASE to your backend origin (no trailing slash), redeploy, and add this site’s URL to the API’s CORS_ORIGINS.'
      : ''

  if (!t) {
    throw new Error(
      `Empty response body (HTTP ${res.status}) from ${requestUrl}.${prodHint}`,
    )
  }

  if (t.startsWith('<') || t.startsWith('\ufeff<')) {
    throw new Error(
      `Received HTML instead of JSON (HTTP ${res.status}) from ${requestUrl}.` +
        (import.meta.env.PROD
          ? ' The request probably hit the static app (not your API), often because BACKEND_URL / VITE_API_BASE was not set at build time.'
          : '') +
        prodHint,
    )
  }

  try {
    return JSON.parse(t) as T
  } catch (e) {
    const err = e instanceof Error ? e.message : 'Invalid JSON'
    throw new Error(
      `${err} (HTTP ${res.status}) from ${requestUrl}. Body starts with: ${t.slice(0, 100)}${t.length > 100 ? '…' : ''}`,
    )
  }
}

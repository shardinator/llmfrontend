/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Full API origin, no trailing slash (e.g. https://api.example.com). Set on Vercel for production. */
  readonly VITE_API_BASE?: string
  /** With VITE_API_PORT, builds API URL when VITE_API_BASE is unset (local / custom). */
  readonly VITE_API_PROTOCOL?: string
  readonly VITE_API_HOST?: string
  readonly VITE_API_PORT?: string
  /** @deprecated use VITE_API_PORT */
  readonly VITE_BACKEND_PORT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend url, e.g. http://localhost:4001 (default: same host as the page, port 4001) */
  readonly VITE_API_URL?: string
  /** WebSocket url of the backend (default: VITE_API_URL with the ws protocol) */
  readonly VITE_WS_URL?: string
}

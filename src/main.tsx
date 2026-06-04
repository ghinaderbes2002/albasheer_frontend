import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/App.tsx'
import '@/index.css'

// After a new deploy, lazy-loaded chunks get new hashed filenames. A browser
// holding a stale index.html requests an old chunk that no longer exists,
// causing "Failed to fetch dynamically imported module". Vite fires
// `vite:preloadError` in that case — reload once to pull the fresh index.html.
const RELOAD_FLAG = 'chunk-reload-once'
window.addEventListener('vite:preloadError', () => {
  if (sessionStorage.getItem(RELOAD_FLAG)) return // avoid reload loop
  sessionStorage.setItem(RELOAD_FLAG, '1')
  window.location.reload()
})
// Clear the guard on a fully successful load so future deploys can reload again.
window.addEventListener('load', () => {
  sessionStorage.removeItem(RELOAD_FLAG)
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts.js'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { initRouter } from './router.js'
import { registerServiceWorker } from './pwa/registerServiceWorker.js'
import { setUpdate } from './pwa/updateStore.js'
import { startAuth } from './auth/useAuth.js'

initRouter()
// Listen for sign-in changes before the first render, so a link's session is never missed.
startAuth()
registerServiceWorker({ onUpdateReady: setUpdate })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

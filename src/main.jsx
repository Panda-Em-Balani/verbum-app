import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts.js'
import './index.css'
import App from './App.jsx'
import { initRouter } from './router.js'
import { registerServiceWorker } from './pwa/registerServiceWorker.js'
import { setUpdate } from './pwa/updateStore.js'

initRouter()
registerServiceWorker({ onUpdateReady: setUpdate })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

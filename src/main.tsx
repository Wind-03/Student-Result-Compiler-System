import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { setupMocks } from './mocks'

// The app talks to the real SRCS backend by default. Set VITE_USE_MOCKS=true
// in .env to fall back to the in-browser mock adapter (no server needed).
if (import.meta.env.VITE_USE_MOCKS === 'true') {
  setupMocks()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

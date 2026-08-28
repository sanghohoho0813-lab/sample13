import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { DemoProvider } from './lib/data/store'
import { ToastProvider } from './components/ui'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <DemoProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </DemoProvider>
    </BrowserRouter>
  </StrictMode>,
)

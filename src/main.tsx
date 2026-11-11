import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Global styles first, so component styles can build on them.
import './styles/global.css'
import { App } from './App'

const root = document.getElementById('root')
if (!root) throw new Error('Root element missing')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

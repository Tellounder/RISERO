import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import Admin from './Admin'
import './styles.css'

const RootView = window.location.pathname.replace(/\/+$/, '') === '/admin' ? Admin : App

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootView />
  </StrictMode>,
)

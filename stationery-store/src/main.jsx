import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Hide loading screen after React mounts
const loader = document.getElementById('app-loading')
if (loader) {
  loader.style.opacity = '0'
  setTimeout(() => loader.remove(), 350)
}

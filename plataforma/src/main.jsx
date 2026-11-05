import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './auth.jsx'
import './estilos.css'

createRoot(document.getElementById('raiz')).render(
  <React.StrictMode>
    {/* HashRouter: o GitHub Pages não tem servidor, então o endereço usa "#/pagina". */}
    <HashRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/ToastProvider'
import { ThemeProvider } from './context/ThemeContext'
import { SettingsProvider } from './context/SettingsContext'
import ErrorBoundary from './components/ErrorBoundary'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <SettingsProvider>
          <AuthProvider>
            <BrowserRouter>
              <ToastProvider>
                <App />
              </ToastProvider>
            </BrowserRouter>
          </AuthProvider>
        </SettingsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)

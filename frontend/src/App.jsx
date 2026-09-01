import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import AppRoutes from './routes/AppRoutes'
import PWAInstallPrompt from './components/common/PWAInstallPrompt'
import { KdsLoadingPopup } from './components/loading-page'
import { TooltipProvider } from '@/components/ui/tooltip'

function AppContent() {
  const { isBooting, setIsBooting, user } = useAuth()

  return (
    <>
      <KdsLoadingPopup
        isOpen={isBooting}
        user={user}
        title="SKYPARK"
        subMessage="INITIALIZING SYSTEM"
        onComplete={() => setIsBooting(false)}
      />
      <PWAInstallPrompt />
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--color-card)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: 'var(--color-card)' } },
          error: { iconTheme: { primary: '#ef4444', secondary: 'var(--color-card)' } },
        }}
      />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <AppContent />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

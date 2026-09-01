import { useState, useEffect } from 'react'
import { Download, X, WifiOff } from 'lucide-react'

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstall, setShowInstall] = useState(false)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    // Listen for install prompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Only show if user hasn't dismissed it in this session
      const dismissed = sessionStorage.getItem('pwa_prompt_dismissed')
      if (!dismissed) {
        setShowInstall(true)
      }
    }

    // Offline / Online listeners
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowInstall(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowInstall(false)
    sessionStorage.setItem('pwa_prompt_dismissed', 'true')
  }

  return (
    <>
      {/* Offline Banner */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-slate-900 px-4 py-2 text-center text-xs font-black flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top duration-200">
          <WifiOff size={15} />
          <span>You are currently offline. Running in cached offline mode.</span>
        </div>
      )}

      {/* PWA Install Banner */}
      {showInstall && (
        <div className="fixed bottom-20 left-4 right-4 z-40 max-w-sm mx-auto bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-3.5 shadow-2xl border border-white/10 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ff1837] to-[#ff4757] flex items-center justify-center text-white shrink-0 shadow-md font-black text-sm">
              🍔
            </div>
            <div className="min-w-0">
              <p className="font-extrabold text-xs text-white truncate">Install exView App</p>
              <p className="text-[10px] text-slate-300 truncate">Add to Home Screen for fast ordering</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstall}
              className="px-3 py-1.5 rounded-xl bg-[#ff1837] hover:bg-[#e01e38] text-white text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <Download size={13} />
              <span>Install</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

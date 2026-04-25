import { useEffect, useState, useCallback } from 'react'

export interface PWAState {
  isInstallable: boolean
  isInstalled: boolean
  isOnline: boolean
  deferredPrompt: any
}

export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    deferredPrompt: null,
  })

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Ignore registration errors
      })
    }

    // Check if app is installed
    const isInstalled =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    setState((prev) => ({ ...prev, isInstalled }))

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setState((prev) => ({ ...prev, isInstallable: true, deferredPrompt: e }))
    }

    // Listen for online/offline
    const handleOnline = () => setState((prev) => ({ ...prev, isOnline: true }))
    const handleOffline = () => setState((prev) => ({ ...prev, isOnline: false }))

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const install = useCallback(async () => {
    if (!state.deferredPrompt) return false

    state.deferredPrompt.prompt()
    const { outcome } = await state.deferredPrompt.userChoice
    setState((prev) => ({ ...prev, deferredPrompt: null, isInstallable: false }))
    return outcome === 'accepted'
  }, [state.deferredPrompt])

  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) return false
    if (Notification.permission === 'granted') return true
    if (Notification.permission === 'denied') return false

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }, [])

  const requestBackgroundSync = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('SyncManager' in window)) return false

    try {
      const registration = await navigator.serviceWorker.ready
      await (registration as any).sync.register('sync-contributions')
      return true
    } catch {
      return false
    }
  }, [])

  return {
    ...state,
    install,
    requestNotificationPermission,
    requestBackgroundSync,
  }
}

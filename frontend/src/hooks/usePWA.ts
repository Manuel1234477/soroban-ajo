'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  registerServiceWorker,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from '@/services/pushNotifications';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  swRegistered: boolean;
  pushPermission: NotificationPermission | 'unsupported';
  isPushSubscribed: boolean;
  hasPendingUpdate: boolean;
}

/**
 * Consolidated PWA hook providing install prompt, push notification management,
 * online/offline detection, and service worker update handling.
 */
export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    swRegistered: false,
    pushPermission: 'default',
    isPushSubscribed: false,
    hasPendingUpdate: false,
  });

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // ── Service Worker registration ───────────────────────────────────────────

  useEffect(() => {
    registerServiceWorker().then((reg) => {
      if (!reg) return;
      setSwRegistration(reg);
      setState((s) => ({ ...s, swRegistered: true }));

      // Listen for waiting SW (update available)
      if (reg.waiting) {
        setState((s) => ({ ...s, hasPendingUpdate: true }));
      }
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setState((s) => ({ ...s, hasPendingUpdate: true }));
          }
        });
      });
    });
  }, []);

  // ── Install prompt ────────────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setState((s) => ({ ...s, isInstallable: true }));
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Detect if already installed
    const mq = window.matchMedia('(display-mode: standalone)');
    if (mq.matches) setState((s) => ({ ...s, isInstalled: true, isInstallable: false }));
    const mqHandler = (e: MediaQueryListEvent) => {
      if (e.matches) setState((s) => ({ ...s, isInstalled: true, isInstallable: false }));
    };
    mq.addEventListener('change', mqHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      mq.removeEventListener('change', mqHandler);
    };
  }, []);

  // ── Online/offline ────────────────────────────────────────────────────────

  useEffect(() => {
    const onOnline = () => setState((s) => ({ ...s, isOnline: true }));
    const onOffline = () => setState((s) => ({ ...s, isOnline: false }));
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // ── Push permission state ─────────────────────────────────────────────────

  useEffect(() => {
    if (!('Notification' in window)) {
      setState((s) => ({ ...s, pushPermission: 'unsupported' }));
      return;
    }
    setState((s) => ({ ...s, pushPermission: Notification.permission }));

    // Check existing subscription
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) =>
        reg.pushManager.getSubscription().then((sub) => {
          setState((s) => ({ ...s, isPushSubscribed: !!sub }));
        })
      );
    }
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setState((s) => ({ ...s, isInstallable: false, isInstalled: true }));
    }
    return outcome === 'accepted';
  }, [deferredPrompt]);

  const enablePush = useCallback(async () => {
    const sub = await subscribeToPushNotifications();
    if (sub) {
      setState((s) => ({ ...s, isPushSubscribed: true, pushPermission: 'granted' }));
    }
    return !!sub;
  }, []);

  const disablePush = useCallback(async () => {
    const ok = await unsubscribeFromPushNotifications();
    if (ok) setState((s) => ({ ...s, isPushSubscribed: false }));
    return ok;
  }, []);

  const applyUpdate = useCallback(() => {
    if (!swRegistration?.waiting) return;
    swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  }, [swRegistration]);

  /**
   * Queue an action for background sync when offline.
   * The service worker will replay it when connectivity is restored.
   */
  const queueOfflineAction = useCallback(
    (url: string, method: string, body: unknown) => {
      if (!swRegistration) return;
      navigator.serviceWorker.controller?.postMessage({
        type: 'QUEUE_ACTION',
        payload: { url, method, body },
      });
      swRegistration.sync?.register('sync-actions').catch(() => {/* not supported */});
    },
    [swRegistration]
  );

  return { ...state, promptInstall, enablePush, disablePush, applyUpdate, queueOfflineAction };
}

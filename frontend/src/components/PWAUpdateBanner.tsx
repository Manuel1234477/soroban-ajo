'use client';

import { RefreshCw, X } from 'lucide-react';
import { useState } from 'react';
import { usePWA } from '@/hooks/usePWA';

/**
 * Shows a banner when a new service worker version is available.
 * Lets the user apply the update immediately.
 */
export function PWAUpdateBanner() {
  const { hasPendingUpdate, applyUpdate } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!hasPendingUpdate || dismissed) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-indigo-600 text-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 animate-slide-up"
    >
      <RefreshCw className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">Update available</p>
        <p className="text-xs text-indigo-200">Reload to get the latest version</p>
      </div>
      <button
        onClick={applyUpdate}
        className="px-3 py-1.5 bg-white text-indigo-600 rounded-lg text-xs font-semibold hover:bg-indigo-50 transition-colors flex-shrink-0"
      >
        Reload
      </button>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss update banner"
        className="text-indigo-200 hover:text-white transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

'use client';

export const dynamic = 'force-dynamic';

import { WifiOff, RefreshCw, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    // Count pending sync actions from cache
    if ('caches' in window) {
      caches.open('ajo-pending-actions').then((cache) =>
        cache.keys().then((keys) => setPendingCount(keys.length))
      ).catch(() => {});
    }

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center max-w-md">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${isOnline ? 'bg-green-100 dark:bg-green-900' : 'bg-orange-100 dark:bg-orange-900'}`}>
          {isOnline
            ? <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            : <WifiOff className="w-10 h-10 text-orange-600 dark:text-orange-400" />
          }
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {isOnline ? 'Back Online!' : "You're Offline"}
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {isOnline
            ? 'Your connection has been restored. You can now access all features.'
            : "It looks like you've lost your internet connection. Some features may not be available until you're back online."
          }
        </p>

        {!isOnline && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-left mb-6">
            <h2 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              What you can still do:
            </h2>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• View previously loaded pages</li>
              <li>• Browse cached group data</li>
              <li>• Queue contributions for sync</li>
            </ul>
          </div>
        )}

        {pendingCount > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-6 text-sm text-amber-800 dark:text-amber-200">
            <strong>{pendingCount}</strong> action{pendingCount !== 1 ? 's' : ''} queued — will sync when online
          </div>
        )}

        <button
          onClick={() => window.location.href = '/'}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          {isOnline ? 'Go to Dashboard' : 'Try Again'}
        </button>
      </div>
    </div>
  );
}

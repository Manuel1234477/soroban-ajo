'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, CheckCircle2, Loader2 } from 'lucide-react';

interface WalletSetupStepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const wallets = [
  {
    id: 'freighter' as const,
    name: 'Freighter',
    description: 'Official Stellar wallet — recommended for beginners',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" fill="url(#freighter-gradient)" />
        <path d="M16 8L24 12V20L16 24L8 20V12L16 8Z" fill="white" fillOpacity="0.9" />
        <defs>
          <linearGradient id="freighter-gradient" x1="0" y1="0" x2="32" y2="32">
            <stop stopColor="#7B61FF" />
            <stop offset="1" stopColor="#5B47E0" />
          </linearGradient>
        </defs>
      </svg>
    ),
    installUrl: 'https://freighter.app',
    badge: 'Recommended',
  },
  {
    id: 'lobstr' as const,
    name: 'LOBSTR',
    description: 'Popular Stellar wallet with mobile support',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" fill="#0F9D58" />
        <path d="M10 22C10 22 12 18 16 18C20 18 22 22 22 22C22 22 20 14 16 14C12 14 10 22 10 22Z" fill="white" />
        <circle cx="16" cy="10" r="3" fill="white" />
      </svg>
    ),
    installUrl: 'https://lobstr.co',
    badge: null,
  },
];

export function WalletSetupStep({ onNext, onBack, onSkip }: WalletSetupStepProps) {
  const { connect, isConnected, address, isLoading, error } = useWallet();
  const [connecting, setConnecting] = useState<string | null>(null);
  const [hoveredWallet, setHoveredWallet] = useState<string | null>(null);

  const handleConnect = async (walletId: 'freighter' | 'lobstr') => {
    setConnecting(walletId);
    const result = await connect({ walletType: walletId, network: 'testnet' });
    setConnecting(null);
    if (result.success) {
      setTimeout(onNext, 500);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl mb-4 shadow-lg shadow-amber-500/30"
        >
          <span className="text-3xl">👛</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-surface-900 dark:text-white mb-2"
        >
          Connect Your Wallet
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-surface-500 dark:text-surface-400 text-sm"
        >
          Your Stellar wallet is your identity on Ajo. No passwords needed.
        </motion.p>
      </div>

      <AnimatePresence mode="wait">
        {isConnected && address ? (
          <motion.div
            key="connected"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gradient-to-r from-success-50 to-success-100 dark:from-success-500/10 dark:to-success-500/20 border border-success-200 dark:border-success-700 rounded-xl p-4 mb-6 flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-success-100 dark:bg-success-500/30 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-success-600 dark:text-success-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-success-700 dark:text-success-400 text-sm">Wallet connected!</p>
              <p className="text-xs font-mono text-surface-500 dark:text-surface-400">
                {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="wallets"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3 mb-6"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-surface-400 mb-3">
              Choose a wallet
            </p>
            {wallets.map((w) => (
              <motion.button
                key={w.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onMouseEnter={() => setHoveredWallet(w.id)}
                onMouseLeave={() => setHoveredWallet(null)}
                onClick={() => handleConnect(w.id)}
                disabled={isLoading || !!connecting}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left ${
                  hoveredWallet === w.id
                    ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 shadow-md'
                    : 'bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700 hover:border-primary-200 dark:hover:border-primary-800'
                }`}
              >
                <div className="flex-shrink-0">{w.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-surface-900 dark:text-white">{w.name}</span>
                    {w.badge && (
                      <span className="text-xs bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full">
                        {w.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-surface-500 dark:text-surface-400">{w.description}</p>
                </div>
                {connecting === w.id ? (
                  <Loader2 className="w-5 h-5 text-primary-500 animate-spin flex-shrink-0" />
                ) : hoveredWallet === w.id ? (
                  <ExternalLink className="w-5 h-5 text-primary-500 flex-shrink-0" />
                ) : (
                  <svg className="w-5 h-5 text-surface-300 dark:text-surface-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-error-50 dark:bg-error-500/10 border border-error-100 dark:border-error-700 rounded-xl p-3 mb-4"
          >
            <p className="text-sm text-error-700 dark:text-error-400">{error.message}</p>
            {error.code === 'WALLET_NOT_INSTALLED' && (
              <a
                href={wallets.find(w => w.id === error.walletType)?.installUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary-600 dark:text-primary-400 underline mt-1 inline-flex items-center gap-1"
              >
                Install {error.walletType} <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-warning-50 dark:bg-warning-500/10 border border-warning-100 dark:border-warning-700 rounded-xl p-3 mb-6">
        <p className="text-xs text-warning-700 dark:text-warning-400">
          <strong>Testnet mode:</strong> Make sure your wallet is set to Stellar Testnet.
          Get free XLM from{' '}
          <a
            href="https://friendbot.stellar.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium"
          >
            Stellar Friendbot
          </a>.
        </p>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="text-sm text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
        >
          ← Back
        </button>
        <div className="flex gap-3">
          {!isConnected && (
            <button
              onClick={onSkip}
              className="text-sm text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
            >
              Skip for now
            </button>
          )}
          <button
            onClick={onNext}
            className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white font-medium rounded-xl transition-all shadow-sm"
          >
            {isConnected ? 'Continue →' : 'Skip →'}
          </button>
        </div>
      </div>
    </div>
  );
}
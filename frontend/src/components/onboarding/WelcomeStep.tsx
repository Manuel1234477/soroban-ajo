'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight } from 'lucide-react';

interface WelcomeStepProps {
  onNext: () => void;
  onSkip: () => void;
}

const concepts = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Pool Together',
    description: 'Members contribute a fixed amount every cycle into a shared pot.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: 'Rotate Payouts',
    description: 'Each cycle, one member receives the full pool. Everyone gets a turn.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Blockchain Secured',
    description: 'Every transaction is recorded on Stellar — transparent and tamper-proof.',
  },
];

export function WelcomeStep({ onNext, onSkip }: WelcomeStepProps) {
  const [visible, setVisible] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);

  const handleNext = () => {
    setVisible(false);
    setTimeout(onNext, 300);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedFeature === null) {
        setSelectedFeature(0);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [selectedFeature]);

  return (
    <div>
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-4 shadow-lg shadow-primary-500/30"
        >
          <span className="text-3xl">👋</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-surface-900 dark:text-white mb-2"
        >
          Welcome to Ajo
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-surface-500 dark:text-surface-400"
        >
          A decentralized savings group platform built on Stellar.
        </motion.p>
      </div>

      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-500 text-center mb-4">
          How it works — Click to learn more
        </p>
        <div className="space-y-3">
          {concepts.map((c, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * (i + 1) }}
              onClick={() => setSelectedFeature(selectedFeature === i ? null : i)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                selectedFeature === i
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 hover:border-primary-300 dark:hover:border-primary-700'
              }`}
            >
              <div className={`flex-shrink-0 ${selectedFeature === i ? 'text-primary-600 dark:text-primary-400' : 'text-surface-400 dark:text-surface-500'}`}>
                {c.icon}
              </div>
              <div className="flex-1">
                <p className={`font-semibold text-sm ${selectedFeature === i ? 'text-primary-700 dark:text-primary-300' : 'text-surface-900 dark:text-white'}`}>
                  {c.title}
                </p>
                <AnimatePresence>
                  {selectedFeature === i && (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="text-sm text-surface-500 dark:text-surface-400 mt-1 overflow-hidden"
                    >
                      {c.description}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              {selectedFeature === i && (
                <CheckCircle2 className="w-5 h-5 text-primary-500 flex-shrink-0" />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/30 border border-primary-100 dark:border-primary-800 rounded-xl p-4 mb-6"
      >
        <p className="text-sm font-semibold text-primary-700 dark:text-primary-300 mb-1">
          Quick example
        </p>
        <p className="text-sm text-primary-600 dark:text-primary-400">
          5 friends each contribute <span className="font-mono font-bold">100 XLM</span>/month. Month 1: Friend A gets 500 XLM. After 5 months, everyone has received their payout.
        </p>
      </motion.div>

      <div className="flex justify-between items-center">
        <button
          onClick={onSkip}
          className="text-sm text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
        >
          Skip tutorial
        </button>
        <button
          onClick={handleNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white font-medium rounded-xl transition-all shadow-sm shadow-primary-500/30"
        >
          Get started
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
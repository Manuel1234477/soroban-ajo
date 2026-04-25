'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Users, ArrowRight, CheckCircle2 } from 'lucide-react';

interface FirstGroupStepProps {
  onComplete: () => void;
  onBack: () => void;
}

type Choice = 'create' | 'join' | null;

const createSteps = [
  { icon: '✏️', text: 'Name your group and set a contribution amount' },
  { icon: '📅', text: 'Choose a cycle length (e.g. monthly)' },
  { icon: '👥', text: 'Set a max member count and invite people' },
  { icon: '🚀', text: 'Deploy — smart contract is created on Stellar' },
];

const joinSteps = [
  { icon: '🔍', text: 'Browse available groups or use an invite link' },
  { icon: '📋', text: 'Review the group rules: amount, cycle, member count' },
  { icon: '✅', text: 'Click Join and approve the transaction in your wallet' },
  { icon: '💰', text: 'Contribute each cycle and wait for your payout round' },
];

export function FirstGroupStep({ onComplete, onBack }: FirstGroupStepProps) {
  const [choice, setChoice] = useState<Choice>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const steps = choice === 'create' ? createSteps : joinSteps;

  const handleComplete = () => {
    onComplete();
  };

  return (
    <div>
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl mb-4 shadow-lg shadow-violet-500/30"
        >
          <span className="text-3xl">👥</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-surface-900 dark:text-white mb-2"
        >
          Your First Group
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-surface-500 dark:text-surface-400 text-sm"
        >
          You can create a new savings group or join an existing one.
        </motion.p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => setChoice('create')}
          className={`p-4 rounded-xl border-2 text-center transition-all ${
            choice === 'create'
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md'
              : 'border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 hover:border-primary-300 dark:hover:border-primary-700'
          }`}
        >
          <div className="w-12 h-12 mx-auto mb-3 bg-primary-100 dark:bg-primary-900/40 rounded-xl flex items-center justify-center">
            <PlusCircle className={`w-6 h-6 ${choice === 'create' ? 'text-primary-600 dark:text-primary-400' : 'text-surface-400'}`} />
          </div>
          <p className="font-semibold text-surface-900 dark:text-white text-sm">Create a group</p>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">Start your own ROSCA</p>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          onClick={() => setChoice('join')}
          className={`p-4 rounded-xl border-2 text-center transition-all ${
            choice === 'join'
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md'
              : 'border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 hover:border-primary-300 dark:hover:border-primary-700'
          }`}
        >
          <div className="w-12 h-12 mx-auto mb-3 bg-violet-100 dark:bg-violet-900/40 rounded-xl flex items-center justify-center">
            <Users className={`w-6 h-6 ${choice === 'join' ? 'text-violet-600 dark:text-violet-400' : 'text-surface-400'}`} />
          </div>
          <p className="font-semibold text-surface-900 dark:text-white text-sm">Join a group</p>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">Find an existing one</p>
        </motion.button>
      </div>

      <AnimatePresence>
        {choice && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl p-4 mb-6 overflow-hidden"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-500 mb-3">
              How to {choice === 'create' ? 'create' : 'join'}
            </p>
            <div className="space-y-2">
              {steps.map((s, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setExpandedStep(expandedStep === i ? null : i)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                    expandedStep === i
                      ? 'bg-primary-50 dark:bg-primary-900/20'
                      : 'hover:bg-surface-100 dark:hover:bg-surface-700'
                  }`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    expandedStep === i
                      ? 'bg-primary-500 text-white'
                      : 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                  }`}>
                    {expandedStep === i ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className="flex-1 text-sm text-surface-700 dark:text-surface-300">
                    {s.icon} {s.text}
                  </span>
                  <ArrowRight className={`w-4 h-4 text-surface-400 transition-transform ${expandedStep === i ? 'rotate-90' : ''}`} />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-accent-50 dark:bg-accent-900/20 border border-accent-100 dark:border-accent-800 rounded-xl p-3 mb-6"
      >
        <p className="text-xs text-accent-700 dark:text-accent-300">
          <strong>Tip:</strong> You can always replay this tutorial from your profile settings.
        </p>
      </motion.div>

      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="text-sm text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
        >
          ← Back
        </button>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={handleComplete}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white font-medium rounded-xl transition-all shadow-sm shadow-primary-500/30"
        >
          Start using Ajo
          <span className="text-lg">🎉</span>
        </motion.button>
      </div>
    </div>
  );
}
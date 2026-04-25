'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { WelcomeStep } from './WelcomeStep';
import { WalletSetupStep } from './WalletSetupStep';
import { FirstGroupStep } from './FirstGroupStep';
import { X } from 'lucide-react';

const STEPS = ['Welcome', 'Wallet', 'First Group'];

interface OnboardingFlowProps {
  showCloseButton?: boolean;
}

export function OnboardingFlow({ showCloseButton = true }: OnboardingFlowProps) {
  const {
    isOnboardingActive,
    currentStep,
    skipOnboarding,
    completeOnboarding,
    nextStep,
    prevStep,
  } = useOnboarding();

  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOnboardingActive) return;

      switch (e.key) {
        case 'Escape':
          skipOnboarding();
          break;
        case 'ArrowRight':
          if (currentStep < STEPS.length - 1) nextStep();
          break;
        case 'ArrowLeft':
          if (currentStep > 0) prevStep();
          break;
      }
    },
    [isOnboardingActive, currentStep, nextStep, prevStep, skipOnboarding]
  );

  useEffect(() => {
    if (isOnboardingActive) {
      containerRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOnboardingActive, handleKeyDown]);

  if (!isOnboardingActive) return null;

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Ajo onboarding tutorial"
      onClick={(e) => {
        if (e.target === e.currentTarget) skipOnboarding();
      }}
    >
      <div
        ref={containerRef}
        tabIndex={-1}
        className="relative w-full max-w-lg bg-white dark:bg-surface-900 rounded-2xl shadow-2xl outline-none overflow-hidden animate-in zoom-in-95 duration-300"
      >
        {showCloseButton && (
          <button
            onClick={skipOnboarding}
            className="absolute top-4 right-4 p-2 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors z-10"
            aria-label="Close onboarding"
          >
            <X size={18} />
          </button>
        )}

        <div className="px-6 pt-5 pb-4 border-b border-surface-100 dark:border-surface-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {STEPS.map((label, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span
                    className={`text-xs font-medium transition-colors ${
                      i === currentStep
                        ? 'text-primary-600 dark:text-primary-400'
                        : i < currentStep
                        ? 'text-success-600 dark:text-success-400'
                        : 'text-surface-400 dark:text-surface-600'
                    }`}
                  >
                    {i < currentStep ? (
                      <svg className="w-3 h-3 inline" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      i + 1
                    )}
                    . {label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <span className="text-surface-300 dark:text-surface-700 text-xs">›</span>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={skipOnboarding}
              className="text-xs text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
              aria-label="Skip onboarding tutorial"
            >
              Skip all
            </button>
          </div>

          <div
            className="h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={currentStep + 1}
            aria-valuemin={1}
            aria-valuemax={STEPS.length}
            aria-label="Tutorial progress"
          >
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between mt-2 text-xs text-surface-400">
            <span>Step {currentStep + 1} of {STEPS.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
        </div>

        <div className="p-6 min-h-[400px]">
          {currentStep === 0 && (
            <WelcomeStep onNext={nextStep} onSkip={skipOnboarding} />
          )}
          {currentStep === 1 && (
            <WalletSetupStep onNext={nextStep} onBack={prevStep} onSkip={skipOnboarding} />
          )}
          {currentStep === 2 && (
            <FirstGroupStep onComplete={completeOnboarding} onBack={prevStep} />
          )}
        </div>

        <div className="px-6 py-4 bg-surface-50 dark:bg-surface-800/50 border-t border-surface-100 dark:border-surface-800 flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          <div className="flex gap-2">
            {currentStep < STEPS.length - 1 && (
              <button
                onClick={skipOnboarding}
                className="px-4 py-2 text-sm text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
              >
                Skip to end
              </button>
            )}
          </div>
          <div className="text-xs text-surface-400">
            Press Esc to close
          </div>
        </div>
      </div>
    </div>
  );
}
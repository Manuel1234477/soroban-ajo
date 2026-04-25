'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useShortcutRegistry, type RegisteredShortcut } from '@/hooks/useShortcutRegistry';
import { ShortcutModal } from './ShortcutModal';

/**
 * Global keyboard shortcuts provider.
 * Registers app-wide shortcuts and renders the shortcut help modal.
 * Mount once inside AppLayout.
 */
export function GlobalShortcutsProvider() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    resolved,
    shortcuts: registered,
    overrides,
    conflicts,
    register,
    customize,
    resetOverride,
    resetAllOverrides,
    hasConflict,
  } = useShortcutRegistry();

  // Register global shortcuts once
  useEffect(() => {
    const globalShortcuts: RegisteredShortcut[] = [
      {
        id: 'nav-home',
        key: 'h',
        modifiers: ['ctrl', 'shift'],
        description: 'Go to Home',
        group: 'Navigation',
        handler: () => router.push('/'),
        ignoreInInputs: true,
        customizable: true,
      },
      {
        id: 'nav-dashboard',
        key: 'd',
        modifiers: ['ctrl', 'shift'],
        description: 'Go to Dashboard',
        group: 'Navigation',
        handler: () => router.push('/dashboard'),
        ignoreInInputs: true,
        customizable: true,
      },
      {
        id: 'nav-groups',
        key: 'g',
        modifiers: ['ctrl', 'shift'],
        description: 'Go to Groups',
        group: 'Navigation',
        handler: () => router.push('/groups'),
        ignoreInInputs: true,
        customizable: true,
      },
      {
        id: 'nav-analytics',
        key: 'a',
        modifiers: ['ctrl', 'shift'],
        description: 'Go to Analytics',
        group: 'Navigation',
        handler: () => router.push('/analytics'),
        ignoreInInputs: true,
        customizable: true,
      },
      {
        id: 'nav-transactions',
        key: 't',
        modifiers: ['ctrl', 'shift'],
        description: 'Go to Transactions',
        group: 'Navigation',
        handler: () => router.push('/transactions'),
        ignoreInInputs: true,
        customizable: true,
      },
      {
        id: 'nav-profile',
        key: 'p',
        modifiers: ['ctrl', 'shift'],
        description: 'Go to Profile',
        group: 'Navigation',
        handler: () => router.push('/profile'),
        ignoreInInputs: true,
        customizable: true,
      },
      {
        id: 'shortcut-help',
        key: '?',
        description: 'Show keyboard shortcuts',
        group: 'General',
        handler: () => setIsModalOpen((o) => !o),
        ignoreInInputs: true,
        customizable: false,
      },
      {
        id: 'close-modal',
        key: 'Escape',
        description: 'Close modal / dialog',
        group: 'General',
        handler: () => setIsModalOpen(false),
        ignoreInInputs: false,
        customizable: false,
      },
    ];
    register(globalShortcuts);
  }, [register, router]);

  // Wire resolved shortcuts into the keyboard listener
  useKeyboardShortcuts(resolved, { enabled: true });

  return (
    <ShortcutModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      shortcuts={resolved}
      registeredShortcuts={registered}
      overrides={overrides}
      onCustomize={customize}
      onResetOverride={resetOverride}
      onResetAll={resetAllOverrides}
      hasConflict={hasConflict}
    />
  );
}

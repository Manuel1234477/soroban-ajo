import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import { X, RotateCcw } from 'lucide-react'
import { ShortcutDefinition } from '../hooks/useKeyboardShortcuts'
import { ShortcutHint } from './ShortcutHint'
import type { RegisteredShortcut, ShortcutOverride } from '@/hooks/useShortcutRegistry'
import { ShortcutCustomizer } from './ShortcutCustomizer'

export interface ShortcutModalProps {
  isOpen: boolean
  onClose: () => void
  shortcuts: ShortcutDefinition[]
  /** Extended registry shortcuts with customization support */
  registeredShortcuts?: RegisteredShortcut[]
  overrides?: Record<string, ShortcutOverride>
  onCustomize?: (id: string, override: ShortcutOverride) => void
  onResetOverride?: (id: string) => void
  onResetAll?: () => void
  hasConflict?: (id: string) => boolean
}

/**
 * Full-screen modal listing all registered keyboard shortcuts grouped by category.
 * Supports inline shortcut customization when registeredShortcuts are provided.
 */
export const ShortcutModal: React.FC<ShortcutModalProps> = ({
  isOpen,
  onClose,
  shortcuts,
  registeredShortcuts,
  overrides = {},
  onCustomize,
  onResetOverride,
  onResetAll,
  hasConflict,
}) => {
  const closeRef = useRef<HTMLButtonElement>(null)
  const [tab, setTab] = useState<'view' | 'customize'>('view')

  useEffect(() => {
    if (isOpen) setTimeout(() => closeRef.current?.focus(), 50)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Group shortcuts by their `group` field
  const groups = React.useMemo(() => {
    const map = new Map<string, ShortcutDefinition[]>()
    for (const s of shortcuts) {
      const g = s.group ?? 'General'
      if (!map.has(g)) map.set(g, [])
      map.get(g)!.push(s)
    }
    return map
  }, [shortcuts])

  // Group registered shortcuts for customization tab
  const customGroups = React.useMemo(() => {
    if (!registeredShortcuts) return new Map<string, RegisteredShortcut[]>()
    const map = new Map<string, RegisteredShortcut[]>()
    for (const s of registeredShortcuts) {
      const g = s.group ?? 'General'
      if (!map.has(g)) map.set(g, [])
      map.get(g)!.push(s)
    }
    return map
  }, [registeredShortcuts])

  const hasOverrides = Object.keys(overrides).length > 0
  const showCustomizeTab = !!registeredShortcuts?.length && !!onCustomize

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortcut-modal-title"
        >
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            className={clsx(
              'relative z-10 w-full max-w-lg max-h-[85vh] flex flex-col',
              'bg-white dark:bg-gray-900 rounded-2xl shadow-2xl',
              'border border-gray-200 dark:border-gray-700',
            )}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
              <h2 id="shortcut-modal-title" className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Keyboard Shortcuts
              </h2>
              <div className="flex items-center gap-2">
                {hasOverrides && onResetAll && (
                  <button
                    onClick={onResetAll}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1 transition-colors"
                    title="Reset all customizations"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset all
                  </button>
                )}
                <button
                  ref={closeRef}
                  onClick={onClose}
                  aria-label="Close shortcuts"
                  className={clsx(
                    'p-1.5 rounded-lg transition-colors',
                    'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300',
                    'hover:bg-gray-100 dark:hover:bg-gray-800',
                    'focus:outline-none focus:ring-2 focus:ring-indigo-500',
                  )}
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            {showCustomizeTab && (
              <div className="flex border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
                {(['view', 'customize'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={clsx(
                      'flex-1 py-2.5 text-sm font-medium transition-colors capitalize',
                      tab === t
                        ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-6">
              {tab === 'view' ? (
                Array.from(groups.entries()).map(([group, defs]) => (
                  <div key={group}>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
                      {group}
                    </h3>
                    <ul className="space-y-1" role="list">
                      {defs.map((def) => (
                        <li
                          key={`${def.key}-${(def.modifiers ?? []).join('-')}`}
                          className={clsx(
                            'flex items-center justify-between gap-4 px-3 py-2 rounded-lg',
                            'hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors',
                          )}
                        >
                          <span className="text-sm text-gray-700 dark:text-gray-300">{def.description}</span>
                          <ShortcutHint shortcut={def} size="md" className="flex-shrink-0" />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                Array.from(customGroups.entries()).map(([group, defs]) => (
                  <div key={group}>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
                      {group}
                    </h3>
                    <ul className="space-y-0.5" role="list">
                      {defs.map((def) => (
                        <li key={def.id}>
                          <ShortcutCustomizer
                            shortcut={def}
                            hasConflict={hasConflict?.(def.id) ?? false}
                            override={overrides[def.id]}
                            onCustomize={onCustomize!}
                            onReset={onResetOverride ?? (() => {})}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 flex-shrink-0">
              <ShortcutHint shortcut={{ key: '?' }} size="sm" />
              <span className="text-xs text-gray-400 dark:text-gray-500">to toggle this panel</span>
              {showCustomizeTab && tab === 'customize' && (
                <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">Click a key badge to remap</span>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

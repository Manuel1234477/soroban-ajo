'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import type { RegisteredShortcut, ShortcutOverride } from '@/hooks/useShortcutRegistry';
import type { ModifierKey } from '@/hooks/useKeyboardShortcuts';
import { ShortcutHint } from './ShortcutHint';

interface Props {
  shortcut: RegisteredShortcut;
  hasConflict: boolean;
  override?: ShortcutOverride;
  onCustomize: (id: string, override: ShortcutOverride) => void;
  onReset: (id: string) => void;
}

const MODIFIER_KEYS: ModifierKey[] = ['ctrl', 'shift', 'alt'];

/**
 * Inline shortcut editor — click the key badge to record a new key combo.
 */
export function ShortcutCustomizer({ shortcut, hasConflict, override, onCustomize, onReset }: Props) {
  const [recording, setRecording] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const currentKey = override?.key ?? shortcut.key;
  const currentMods = override?.modifiers ?? shortcut.modifiers ?? [];

  useEffect(() => {
    if (!recording) return;

    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Ignore standalone modifier presses
      if (['Control', 'Meta', 'Shift', 'Alt'].includes(e.key)) return;
      if (e.key === 'Escape') {
        setRecording(false);
        return;
      }

      const mods: ModifierKey[] = [];
      if (e.ctrlKey || e.metaKey) mods.push('ctrl');
      if (e.shiftKey) mods.push('shift');
      if (e.altKey) mods.push('alt');

      onCustomize(shortcut.id, { key: e.key, modifiers: mods });
      setRecording(false);
    };

    window.addEventListener('keydown', handler, { capture: true });
    return () => window.removeEventListener('keydown', handler, { capture: true });
  }, [recording, shortcut.id, onCustomize]);

  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors group">
      <div className="flex-1 min-w-0">
        <span className="text-sm text-gray-700 dark:text-gray-300">{shortcut.description}</span>
        {hasConflict && (
          <span className="ml-2 inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-3 h-3" /> conflict
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {recording ? (
          <span className="text-xs text-indigo-600 dark:text-indigo-400 animate-pulse font-medium">
            Press a key…
          </span>
        ) : (
          <button
            ref={btnRef}
            onClick={() => shortcut.customizable !== false && setRecording(true)}
            title={shortcut.customizable !== false ? 'Click to change shortcut' : 'Not customizable'}
            className={`focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded ${shortcut.customizable === false ? 'cursor-default' : 'cursor-pointer hover:opacity-80'}`}
          >
            <ShortcutHint shortcut={{ key: currentKey, modifiers: currentMods }} size="md" />
          </button>
        )}

        {override && (
          <button
            onClick={() => onReset(shortcut.id)}
            title="Reset to default"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Reset shortcut"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

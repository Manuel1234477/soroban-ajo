'use client';

import { useState, useCallback, useMemo } from 'react';
import type { ShortcutDefinition, ModifierKey } from './useKeyboardShortcuts';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RegisteredShortcut extends Omit<ShortcutDefinition, 'handler'> {
  id: string;
  handler: () => void;
  /** Whether this shortcut can be customized by the user */
  customizable?: boolean;
}

export interface ShortcutOverride {
  key: string;
  modifiers?: ModifierKey[];
}

type OverrideMap = Record<string, ShortcutOverride>;

const STORAGE_KEY = 'ajo-shortcut-overrides';

function loadOverrides(): OverrideMap {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveOverrides(overrides: OverrideMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch {}
}

/** Canonical string key for a shortcut, used for conflict detection */
function shortcutKey(key: string, modifiers: ModifierKey[] = []): string {
  return [...modifiers].sort().join('+') + (modifiers.length ? '+' : '') + key.toLowerCase();
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Central shortcut registry.
 * - Merges registered shortcuts with user overrides
 * - Detects conflicts (two shortcuts with the same key combo)
 * - Allows per-shortcut customization persisted to localStorage
 */
export function useShortcutRegistry() {
  const [shortcuts, setShortcuts] = useState<RegisteredShortcut[]>([]);
  const [overrides, setOverrides] = useState<OverrideMap>(loadOverrides);

  // Register a batch of shortcuts (idempotent by id)
  const register = useCallback((defs: RegisteredShortcut[]) => {
    setShortcuts((prev) => {
      const ids = new Set(prev.map((s) => s.id));
      const newOnes = defs.filter((d) => !ids.has(d.id));
      return newOnes.length ? [...prev, ...newOnes] : prev;
    });
  }, []);

  // Unregister by id
  const unregister = useCallback((ids: string[]) => {
    const set = new Set(ids);
    setShortcuts((prev) => prev.filter((s) => !set.has(s.id)));
  }, []);

  // Apply user override for a shortcut
  const customize = useCallback((id: string, override: ShortcutOverride) => {
    setOverrides((prev) => {
      const next = { ...prev, [id]: override };
      saveOverrides(next);
      return next;
    });
  }, []);

  // Reset a single shortcut to its default
  const resetOverride = useCallback((id: string) => {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[id];
      saveOverrides(next);
      return next;
    });
  }, []);

  // Reset all overrides
  const resetAllOverrides = useCallback(() => {
    setOverrides({});
    saveOverrides({});
  }, []);

  // Resolved shortcuts (with overrides applied)
  const resolved = useMemo<ShortcutDefinition[]>(() =>
    shortcuts.map((s) => {
      const override = overrides[s.id];
      return {
        ...s,
        key: override?.key ?? s.key,
        modifiers: override?.modifiers ?? s.modifiers,
      };
    }),
    [shortcuts, overrides]
  );

  // Conflict detection: find shortcuts sharing the same key combo
  const conflicts = useMemo<Map<string, string[]>>(() => {
    const map = new Map<string, string[]>();
    for (const s of resolved) {
      const k = shortcutKey(s.key, s.modifiers);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(s.id);
    }
    // Keep only entries with >1 shortcut
    for (const [k, ids] of map) {
      if (ids.length <= 1) map.delete(k);
    }
    return map;
  }, [resolved]);

  const hasConflict = useCallback(
    (id: string) => {
      const s = resolved.find((r) => r.id === id);
      if (!s) return false;
      const k = shortcutKey(s.key, s.modifiers);
      return (conflicts.get(k)?.length ?? 0) > 1;
    },
    [resolved, conflicts]
  );

  return {
    shortcuts,
    resolved,
    overrides,
    conflicts,
    register,
    unregister,
    customize,
    resetOverride,
    resetAllOverrides,
    hasConflict,
  };
}

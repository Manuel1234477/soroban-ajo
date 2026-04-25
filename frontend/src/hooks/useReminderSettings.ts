import { useState, useCallback, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/apiEndpoints';

export interface ReminderPreferences {
  enabled: boolean;
  /** Hours before contribution deadline to send reminder (1–168) */
  contributionReminderHours: number;
  /** Hours before payout to send reminder (1–48) */
  payoutReminderHours: number;
  channels: ('email' | 'push' | 'sms')[];
  phoneNumber?: string;
  email?: string;
}

const DEFAULT_PREFERENCES: ReminderPreferences = {
  enabled: true,
  contributionReminderHours: 24,
  payoutReminderHours: 2,
  channels: ['email', 'push'],
};

async function fetchPrefs(token: string): Promise<ReminderPreferences> {
  const res = await fetch(`${API_BASE_URL}/api/notifications/reminders/preferences`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load reminder preferences');
  const json = await res.json();
  return json.data as ReminderPreferences;
}

async function savePrefs(token: string, prefs: Partial<ReminderPreferences>): Promise<ReminderPreferences> {
  const res = await fetch(`${API_BASE_URL}/api/notifications/reminders/preferences`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(prefs),
  });
  if (!res.ok) throw new Error('Failed to save reminder preferences');
  const json = await res.json();
  return json.data as ReminderPreferences;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token') ?? sessionStorage.getItem('auth_token');
}

export function useReminderSettings() {
  const [preferences, setPreferences] = useState<ReminderPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load preferences from backend on mount
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    fetchPrefs(token)
      .then(setPreferences)
      .catch(() => { /* silently fall back to defaults */ })
      .finally(() => setLoading(false));
  }, []);

  const updatePreferences = useCallback(async (newPrefs: Partial<ReminderPreferences>) => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const updated = token
        ? await savePrefs(token, newPrefs)
        : { ...preferences, ...newPrefs };
      setPreferences(updated);
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update preferences';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [preferences]);

  const resetToDefaults = useCallback(async () => {
    await updatePreferences(DEFAULT_PREFERENCES).catch(() => setPreferences(DEFAULT_PREFERENCES));
  }, [updatePreferences]);

  return { preferences, updatePreferences, resetToDefaults, loading, error };
}

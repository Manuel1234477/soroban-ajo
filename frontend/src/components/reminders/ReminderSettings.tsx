'use client';

import { useState } from 'react';
import { Bell, Mail, Smartphone, Clock } from 'lucide-react';
import { useReminderSettings } from '@/hooks/useReminderSettings';

const CONTRIBUTION_TIMING_OPTIONS = [
  { label: '1 hour before', value: 1 },
  { label: '6 hours before', value: 6 },
  { label: '24 hours before', value: 24 },
  { label: '48 hours before', value: 48 },
  { label: '1 week before', value: 168 },
];

const PAYOUT_TIMING_OPTIONS = [
  { label: '1 hour before', value: 1 },
  { label: '2 hours before', value: 2 },
  { label: '6 hours before', value: 6 },
  { label: '24 hours before', value: 24 },
  { label: '48 hours before', value: 48 },
];

export function ReminderSettings() {
  const { preferences, updatePreferences, loading, error } = useReminderSettings();
  const [saved, setSaved] = useState(false);

  const handleChange = async (patch: Parameters<typeof updatePreferences>[0]) => {
    await updatePreferences(patch);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChannelToggle = (channel: 'email' | 'push' | 'sms') => {
    const newChannels = preferences.channels.includes(channel)
      ? preferences.channels.filter((c) => c !== channel)
      : [...preferences.channels, channel];
    handleChange({ channels: newChannels });
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="w-6 h-6" />
          Reminder Settings
        </h2>
        {saved && <span className="text-green-600 text-sm font-medium">Saved!</span>}
        {error && <span className="text-red-600 text-sm">{error}</span>}
      </div>

      {/* Enable/Disable */}
      <div className="border-b pb-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={preferences.enabled}
            onChange={(e) => handleChange({ enabled: e.target.checked })}
            disabled={loading}
            className="w-4 h-4"
          />
          <span className="font-medium">Enable Reminders</span>
        </label>
      </div>

      {preferences.enabled && (
        <>
          {/* Contribution reminder timing */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 font-medium">
              <Clock className="w-4 h-4" />
              Contribution Reminder Timing
            </label>
            <select
              value={preferences.contributionReminderHours}
              onChange={(e) => handleChange({ contributionReminderHours: Number(e.target.value) })}
              disabled={loading}
              className="w-full p-2 border rounded-md"
            >
              {CONTRIBUTION_TIMING_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Payout reminder timing */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 font-medium">
              <Clock className="w-4 h-4" />
              Payout Reminder Timing
            </label>
            <select
              value={preferences.payoutReminderHours}
              onChange={(e) => handleChange({ payoutReminderHours: Number(e.target.value) })}
              disabled={loading}
              className="w-full p-2 border rounded-md"
            >
              {PAYOUT_TIMING_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Channels */}
          <div className="space-y-3">
            <label className="font-medium">Notification Channels</label>
            <div className="space-y-2">
              {([
                { id: 'email', label: 'Email', Icon: Mail },
                { id: 'push', label: 'Push Notification', Icon: Bell },
                { id: 'sms', label: 'SMS', Icon: Smartphone },
              ] as const).map(({ id, label, Icon }) => (
                <label key={id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.channels.includes(id)}
                    onChange={() => handleChannelToggle(id)}
                    disabled={loading}
                    className="w-4 h-4"
                  />
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Contact details */}
          {preferences.channels.includes('email') && (
            <div className="space-y-2">
              <label className="font-medium text-sm">Email address for reminders</label>
              <input
                type="email"
                value={preferences.email ?? ''}
                onChange={(e) => handleChange({ email: e.target.value || undefined })}
                disabled={loading}
                placeholder="you@example.com"
                className="w-full p-2 border rounded-md text-sm"
              />
            </div>
          )}

          {preferences.channels.includes('sms') && (
            <div className="space-y-2">
              <label className="font-medium text-sm">Phone number for SMS reminders</label>
              <input
                type="tel"
                value={preferences.phoneNumber ?? ''}
                onChange={(e) => handleChange({ phoneNumber: e.target.value || undefined })}
                disabled={loading}
                placeholder="+1 555 000 0000"
                className="w-full p-2 border rounded-md text-sm"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

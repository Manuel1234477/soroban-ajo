'use client';

import { useReminderSettings } from '@/hooks/useReminderSettings';
import { Mail, Bell, Smartphone, Clock } from 'lucide-react';

const CHANNEL_ICONS = { email: Mail, push: Bell, sms: Smartphone } as const;

function hoursLabel(hours: number): string {
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''}`;
  const days = hours / 24;
  return `${days} day${days !== 1 ? 's' : ''}`;
}

export function ReminderPreview() {
  const { preferences } = useReminderSettings();

  if (!preferences.enabled) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg text-gray-600">
        Reminders are disabled
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
      <h3 className="font-semibold text-blue-900">Reminder Summary</h3>

      <div className="flex items-center gap-2 text-sm">
        <Clock className="w-4 h-4 shrink-0" />
        <span>
          Contribution reminders <strong>{hoursLabel(preferences.contributionReminderHours)} before</strong> deadline
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <Clock className="w-4 h-4 shrink-0" />
        <span>
          Payout reminders <strong>{hoursLabel(preferences.payoutReminderHours)} before</strong> payout
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm flex-wrap">
        <span className="font-medium">Via:</span>
        {preferences.channels.length === 0 ? (
          <span className="text-gray-500">No channels selected</span>
        ) : (
          preferences.channels.map((channel) => {
            const Icon = CHANNEL_ICONS[channel];
            return (
              <div key={channel} className="flex items-center gap-1 bg-white px-2 py-1 rounded border">
                <Icon className="w-3 h-3" />
                <span className="capitalize text-xs">{channel}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

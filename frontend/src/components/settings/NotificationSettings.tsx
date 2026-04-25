'use client'

import React, { useState, useEffect } from 'react'
import { useNotifications, type NotificationPreferences } from '@/hooks/useNotifications'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { Bell, Mail, Smartphone, Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface NotificationSettingsProps {
  groupId: string
}

interface GroupNotificationPrefs {
  memberJoined: boolean
  cycleCompleted: boolean
  contributionDue24h: boolean
  contributionDue1h: boolean
  contributionOverdue: boolean
  payoutReceived: boolean
  announcements: boolean
}

const EVENT_ITEMS: { key: keyof GroupNotificationPrefs; label: string; description: string }[] = [
  {
    key: 'memberJoined',
    label: 'Member Joined',
    description: 'When a new member joins this group',
  },
  {
    key: 'cycleCompleted',
    label: 'Cycle Completed',
    description: 'When a savings cycle finishes',
  },
  {
    key: 'contributionDue24h',
    label: 'Contribution Due (24h)',
    description: '24 hours before your contribution is due',
  },
  {
    key: 'contributionDue1h',
    label: 'Contribution Due (1h)',
    description: '1 hour before your contribution is due',
  },
  {
    key: 'contributionOverdue',
    label: 'Contribution Overdue',
    description: 'When a contribution becomes overdue',
  },
  {
    key: 'payoutReceived',
    label: 'Payout Received',
    description: 'When you receive a payout',
  },
  {
    key: 'announcements',
    label: 'Announcements',
    description: 'Group announcements from the creator',
  },
]

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ groupId: _groupId }) => {
  const { preferences, updatePreferences } = useNotifications()
  const { status, isSubscribed, isLoading: pushLoading, subscribe, unsubscribe } = usePushNotifications()

  const [localPrefs, setLocalPrefs] = useState<GroupNotificationPrefs>({
    memberJoined: preferences.memberJoined,
    cycleCompleted: preferences.cycleCompleted,
    contributionDue24h: preferences.contributionDue24h,
    contributionDue1h: preferences.contributionDue1h,
    contributionOverdue: preferences.contributionOverdue,
    payoutReceived: preferences.payoutReceived,
    announcements: preferences.announcements,
  })

  const [channels, setChannels] = useState({
    inApp: preferences.inApp,
    email: preferences.email,
    push: preferences.push,
  })

  const [isSaving, setIsSaving] = useState(false)

  // Keep local state in sync if preferences change externally
  useEffect(() => {
    setLocalPrefs({
      memberJoined: preferences.memberJoined,
      cycleCompleted: preferences.cycleCompleted,
      contributionDue24h: preferences.contributionDue24h,
      contributionDue1h: preferences.contributionDue1h,
      contributionOverdue: preferences.contributionOverdue,
      payoutReceived: preferences.payoutReceived,
      announcements: preferences.announcements,
    })
    setChannels({ inApp: preferences.inApp, email: preferences.email, push: preferences.push })
  }, [preferences])

  const isDirty =
    localPrefs.memberJoined !== preferences.memberJoined ||
    localPrefs.cycleCompleted !== preferences.cycleCompleted ||
    localPrefs.contributionDue24h !== preferences.contributionDue24h ||
    localPrefs.contributionDue1h !== preferences.contributionDue1h ||
    localPrefs.contributionOverdue !== preferences.contributionOverdue ||
    localPrefs.payoutReceived !== preferences.payoutReceived ||
    localPrefs.announcements !== preferences.announcements ||
    channels.inApp !== preferences.inApp ||
    channels.email !== preferences.email ||
    channels.push !== preferences.push

  const handlePushToggle = async () => {
    if (isSubscribed) {
      const ok = await unsubscribe()
      if (ok) {
        setChannels((c) => ({ ...c, push: false }))
        toast.success('Push notifications disabled')
      } else {
        toast.error('Failed to disable push notifications')
      }
    } else {
      if (status === 'denied') {
        toast.error('Permission denied — enable notifications in browser settings')
        return
      }
      const ok = await subscribe()
      if (ok) {
        setChannels((c) => ({ ...c, push: true }))
        toast.success('Push notifications enabled')
      } else {
        toast.error('Failed to enable push notifications')
      }
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const merged: Partial<NotificationPreferences> = { ...localPrefs, ...channels }
      updatePreferences(merged)
      toast.success('Notification preferences saved')
    } catch {
      toast.error('Failed to save preferences')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleEvent = (key: keyof GroupNotificationPrefs) => {
    setLocalPrefs((p) => ({ ...p, [key]: !p[key] }))
  }

  return (
    <div className="space-y-8 max-w-xl">
      {/* Channels */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          Notification Channels
        </h3>
        <div className="space-y-1 rounded-xl border border-gray-200 dark:border-slate-700 divide-y divide-gray-100 dark:divide-slate-700/50 overflow-hidden">
          {/* In-App */}
          <ChannelRow
            icon={<Bell className="w-5 h-5 text-indigo-500" />}
            label="In-App"
            description="Show notifications inside the app"
            checked={channels.inApp}
            onChange={() => setChannels((c) => ({ ...c, inApp: !c.inApp }))}
          />

          {/* Email */}
          <ChannelRow
            icon={<Mail className="w-5 h-5 text-blue-500" />}
            label="Email"
            description="Receive email notifications"
            checked={channels.email}
            onChange={() => setChannels((c) => ({ ...c, email: !c.email }))}
          />

          {/* Push */}
          <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5 text-purple-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-slate-100">Push</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Browser push notifications
                {status === 'denied' && (
                  <span className="ml-1 text-red-500">(blocked in browser settings)</span>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={handlePushToggle}
              disabled={pushLoading || status === 'denied'}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isSubscribed ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-gray-300 dark:bg-slate-600'
              }`}
              role="switch"
              aria-checked={isSubscribed}
            >
              {pushLoading ? (
                <Loader2 className="w-3 h-3 text-white absolute left-1/2 -translate-x-1/2 animate-spin" />
              ) : (
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isSubscribed ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Event toggles */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          Event Notifications
        </h3>
        <div className="rounded-xl border border-gray-200 dark:border-slate-700 divide-y divide-gray-100 dark:divide-slate-700/50 overflow-hidden">
          {EVENT_ITEMS.map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800">
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{label}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{description}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleEvent(key)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
                  localPrefs[key] ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-gray-300 dark:bg-slate-600'
                }`}
                role="switch"
                aria-checked={localPrefs[key]}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localPrefs[key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      {isDirty && (
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
          <button
            onClick={() => {
              setLocalPrefs({
                memberJoined: preferences.memberJoined,
                cycleCompleted: preferences.cycleCompleted,
                contributionDue24h: preferences.contributionDue24h,
                contributionDue1h: preferences.contributionDue1h,
                contributionOverdue: preferences.contributionOverdue,
                payoutReceived: preferences.payoutReceived,
                announcements: preferences.announcements,
              })
              setChannels({ inApp: preferences.inApp, email: preferences.email, push: preferences.push })
            }}
            disabled={isSaving}
            className="px-5 py-2.5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            Discard
          </button>
        </div>
      )}
    </div>
  )
}

// Internal helper
interface ChannelRowProps {
  icon: React.ReactNode
  label: string
  description: string
  checked: boolean
  onChange: () => void
}

const ChannelRow: React.FC<ChannelRowProps> = ({ icon, label, description, checked, onChange }) => (
  <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800">
    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{label}</p>
      <p className="text-xs text-gray-500 dark:text-slate-400">{description}</p>
    </div>
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
        checked ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-gray-300 dark:bg-slate-600'
      }`}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
)

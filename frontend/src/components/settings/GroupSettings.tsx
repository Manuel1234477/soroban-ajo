'use client'

import React, { useState, useEffect } from 'react'
import { useGroupDetail, useGroupMembers, QUERY_KEYS } from '@/hooks/useContractData'
import { useWallet } from '@/hooks/useWallet'
import { useQueryClient } from '@tanstack/react-query'
import { backendApiClient } from '@/lib/apiClient'
import toast from 'react-hot-toast'
import { Settings, Users, Bell, AlertTriangle, Save, Loader2 } from 'lucide-react'
import { MemberManagement } from './MemberManagement'
import { NotificationSettings } from './NotificationSettings'

type SettingsTab = 'general' | 'members' | 'notifications' | 'danger'

interface GroupSettingsProps {
  groupId: string
}

interface GeneralFormState {
  name: string
  description: string
  maxMembers: number
  isActive: boolean
}

const TAB_CONFIG: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { key: 'general', label: 'General', icon: <Settings className="w-4 h-4" /> },
  { key: 'members', label: 'Members', icon: <Users className="w-4 h-4" /> },
  { key: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  { key: 'danger', label: 'Danger Zone', icon: <AlertTriangle className="w-4 h-4" /> },
]

export const GroupSettings: React.FC<GroupSettingsProps> = ({ groupId }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const [isSaving, setIsSaving] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const { address } = useWallet()
  const queryClient = useQueryClient()
  const { data: group, isLoading } = useGroupDetail(groupId)
  const { data: members = [] } = useGroupMembers(groupId)

  const [form, setForm] = useState<GeneralFormState>({
    name: '',
    description: '',
    maxMembers: 10,
    isActive: true,
  })

  // Sync form when group data loads
  useEffect(() => {
    if (group) {
      setForm({
        name: group.name ?? '',
        description: group.description ?? '',
        maxMembers: group.maxMembers ?? 10,
        isActive: group.status === 'active',
      })
    }
  }, [group])

  const isDirty =
    form.name !== (group?.name ?? '') ||
    form.description !== (group?.description ?? '') ||
    form.maxMembers !== (group?.maxMembers ?? 10) ||
    form.isActive !== (group?.status === 'active')

  const handleSaveGeneral = async () => {
    if (!form.name.trim()) {
      toast.error('Group name is required')
      return
    }
    if (form.maxMembers < members.length) {
      toast.error(`Max members cannot be less than current member count (${members.length})`)
      return
    }

    setIsSaving(true)
    try {
      await backendApiClient.request({
        method: 'PATCH',
        path: `/api/groups/${groupId}`,
        body: {
          name: form.name.trim(),
          description: form.description.trim(),
          maxMembers: form.maxMembers,
          isActive: form.isActive,
        },
      })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GROUP_DETAIL(groupId) })
      toast.success('Group settings saved')
    } catch {
      toast.error('Failed to save settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelGroup = async () => {
    if (!confirmCancel) {
      setConfirmCancel(true)
      return
    }
    setIsSaving(true)
    try {
      await backendApiClient.request({
        method: 'DELETE',
        path: `/api/groups/${groupId}`,
      })
      toast.success('Group cancelled')
      // Navigate away after cancellation
      window.location.href = '/groups'
    } catch {
      toast.error('Failed to cancel group. Please try again.')
      setConfirmCancel(false)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-8">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-2/3" />
          <div className="h-48 bg-gray-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Group Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage configuration, members, and preferences for{' '}
          <span className="font-medium text-gray-700 dark:text-gray-300">{group?.name}</span>
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        {/* Tab navigation */}
        <div className="border-b border-gray-200 dark:border-slate-700">
          <nav className="flex overflow-x-auto">
            {TAB_CONFIG.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key)
                  setConfirmCancel(false)
                }}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === key
                    ? key === 'danger'
                      ? 'border-red-500 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                      : 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6 max-w-xl">
              <div>
                <label
                  htmlFor="group-name"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5"
                >
                  Group Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="group-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  maxLength={100}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700/50 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors text-sm"
                  placeholder="Enter group name"
                />
              </div>

              <div>
                <label
                  htmlFor="group-description"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5"
                >
                  Description
                </label>
                <textarea
                  id="group-description"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700/50 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors text-sm resize-none"
                  placeholder="Describe the purpose of this group"
                />
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 text-right">
                  {form.description.length}/500
                </p>
              </div>

              <div>
                <label
                  htmlFor="max-members"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5"
                >
                  Max Members
                </label>
                <input
                  id="max-members"
                  type="number"
                  min={members.length || 2}
                  max={50}
                  value={form.maxMembers}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, maxMembers: parseInt(e.target.value, 10) || 2 }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700/50 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors text-sm"
                />
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                  Current members: {members.length}. Cannot be set below this value.
                </p>
              </div>

              {/* Read-only fields */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-slate-700">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                    Contribution Amount
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {group?.contributionAmount ?? '—'} XLM
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">Set at creation, immutable</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                    Cycle Length
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {group?.cycleLength ?? '—'} days
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">Set at creation, immutable</p>
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-slate-700">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100">Group Active</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Pause the group to temporarily stop contributions
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    form.isActive ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-gray-300 dark:bg-slate-600'
                  }`}
                  aria-checked={form.isActive}
                  role="switch"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      form.isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {isDirty && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSaveGeneral}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() =>
                      setForm({
                        name: group?.name ?? '',
                        description: group?.description ?? '',
                        maxMembers: group?.maxMembers ?? 10,
                        isActive: group?.status === 'active',
                      })
                    }
                    disabled={isSaving}
                    className="px-5 py-2.5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors text-sm font-medium"
                  >
                    Discard
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <MemberManagement groupId={groupId} creatorAddress={address ?? ''} />
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <NotificationSettings groupId={groupId} />
          )}

          {/* Danger Zone Tab */}
          {activeTab === 'danger' && (
            <div className="max-w-xl space-y-6">
              <div className="rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/10 p-5">
                <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">
                  Cancel Group
                </h3>
                <p className="text-sm text-red-600 dark:text-red-300/80 mb-4">
                  This will permanently cancel the group and notify all members. Any pending
                  contributions will be refunded. This action cannot be undone.
                </p>

                {confirmCancel && (
                  <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700">
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">
                      Are you absolutely sure? Click the button again to confirm.
                    </p>
                  </div>
                )}

                <button
                  onClick={handleCancelGroup}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  {confirmCancel ? 'Confirm Cancellation' : 'Cancel Group'}
                </button>

                {confirmCancel && (
                  <button
                    onClick={() => setConfirmCancel(false)}
                    className="ml-3 text-sm text-gray-500 dark:text-gray-400 hover:underline"
                  >
                    Never mind
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

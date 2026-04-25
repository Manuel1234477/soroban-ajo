'use client'

import React, { useState } from 'react'
import { useGroupMembers, QUERY_KEYS } from '@/hooks/useContractData'
import { useQueryClient } from '@tanstack/react-query'
import { backendApiClient } from '@/lib/apiClient'
import { generateAvatarColor, getAddressInitials, shortenAddress, formatDate } from '@/utils/avatarUtils'
import toast from 'react-hot-toast'
import { UserMinus, Crown, Loader2, UserPlus, Search } from 'lucide-react'

interface MemberManagementProps {
  groupId: string
  creatorAddress: string
}

interface Member {
  address: string
  joinedDate: string
  contributions: number
  totalContributed: number
  cyclesCompleted: number
  status: 'active' | 'inactive' | 'completed'
}

export const MemberManagement: React.FC<MemberManagementProps> = ({ groupId, creatorAddress }) => {
  const queryClient = useQueryClient()
  const { data: members = [], isLoading } = useGroupMembers(groupId)

  const [search, setSearch] = useState('')
  const [removingAddress, setRemovingAddress] = useState<string | null>(null)
  const [inviteAddress, setInviteAddress] = useState('')
  const [isInviting, setIsInviting] = useState(false)

  const filtered = (members as Member[]).filter((m) =>
    m.address.toLowerCase().includes(search.toLowerCase())
  )

  const handleRemoveMember = async (memberAddress: string) => {
    if (memberAddress === creatorAddress) {
      toast.error("You can't remove the group creator")
      return
    }
    setRemovingAddress(memberAddress)
    try {
      await backendApiClient.request({
        method: 'DELETE',
        path: `/api/groups/${groupId}/members/${memberAddress}`,
      })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GROUP_MEMBERS(groupId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GROUP_DETAIL(groupId) })
      toast.success(`Member ${shortenAddress(memberAddress)} removed`)
    } catch {
      toast.error('Failed to remove member. Please try again.')
    } finally {
      setRemovingAddress(null)
    }
  }

  const handleInvite = async () => {
    const addr = inviteAddress.trim()
    if (!addr) return
    if (!addr.startsWith('G') || addr.length < 56) {
      toast.error('Enter a valid Stellar wallet address')
      return
    }
    if ((members as Member[]).some((m) => m.address === addr)) {
      toast.error('This address is already a member')
      return
    }

    setIsInviting(true)
    try {
      await backendApiClient.request({
        method: 'POST',
        path: `/api/groups/${groupId}/invite`,
        body: { walletAddress: addr },
      })
      setInviteAddress('')
      toast.success(`Invitation sent to ${shortenAddress(addr)}`)
    } catch {
      toast.error('Failed to send invitation. Please try again.')
    } finally {
      setIsInviting(false)
    }
  }

  const statusBadge = (status: Member['status']) => {
    const map = {
      active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      inactive: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    }
    return map[status] ?? map.active
  }

  return (
    <div className="space-y-6">
      {/* Invite new member */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Invite Member</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={inviteAddress}
            onChange={(e) => setInviteAddress(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
            placeholder="Stellar wallet address (G...)"
            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700/50 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors text-sm font-mono"
          />
          <button
            onClick={handleInvite}
            disabled={isInviting || !inviteAddress.trim()}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {isInviting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            Invite
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700/50 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors text-sm"
        />
      </div>

      {/* Member count */}
      <p className="text-xs text-gray-500 dark:text-slate-400">
        {members.length} member{members.length !== 1 ? 's' : ''}
        {search && ` · ${filtered.length} matching`}
      </p>

      {/* Member list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-gray-100 dark:bg-slate-700/50 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-400 dark:text-slate-500 text-sm">
          {search ? 'No members match your search.' : 'No members yet.'}
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-slate-700/50">
          {filtered.map((member) => {
            const isCreator = member.address === creatorAddress
            const isRemoving = removingAddress === member.address

            return (
              <div
                key={member.address}
                className="flex items-center gap-4 py-3 group"
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-semibold text-sm"
                  style={{ backgroundColor: generateAvatarColor(member.address) }}
                  title={member.address}
                >
                  {getAddressInitials(member.address)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-medium text-gray-900 dark:text-white truncate">
                      {shortenAddress(member.address)}
                    </span>
                    {isCreator && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-semibold">
                        <Crown className="w-3 h-3" />
                        Creator
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge(member.status)}`}
                    >
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400 dark:text-slate-500">
                    <span>Joined {formatDate(member.joinedDate)}</span>
                    <span>·</span>
                    <span>{member.contributions} contributions</span>
                    <span>·</span>
                    <span>{member.totalContributed.toFixed(2)} XLM</span>
                  </div>
                </div>

                {/* Remove action */}
                {!isCreator && (
                  <button
                    onClick={() => handleRemoveMember(member.address)}
                    disabled={isRemoving}
                    title="Remove member"
                    className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    {isRemoving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserMinus className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

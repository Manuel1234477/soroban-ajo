'use client'

import { useParams, useRouter } from 'next/navigation'
import { GroupSettings } from '@/components/settings/GroupSettings'
import { useGroupDetail } from '@/hooks/useContractData'
import { useWallet } from '@/hooks/useWallet'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function GroupSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params?.id as string
  const { address } = useWallet()

  const { data: group, isLoading } = useGroupDetail(groupId)

  if (!groupId) return null

  // Only the group creator can access settings
  const isCreator = group?.creator === address

  if (!isLoading && !isCreator) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 px-4 py-8">
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Only the group creator can manage settings.
          </p>
          <Link
            href={`/groups/${groupId}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Group
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/groups" className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            Groups
          </Link>
          <span>/</span>
          <Link
            href={`/groups/${groupId}`}
            className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            {isLoading ? '...' : (group?.name ?? groupId)}
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">Settings</span>
        </div>

        <GroupSettings groupId={groupId} />
      </div>
    </div>
  )
}

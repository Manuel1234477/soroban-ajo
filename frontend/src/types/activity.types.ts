// ─── Activity Event Types ─────────────────────────────────────────────────────
// Mirrors backend/src/types/activity.types.ts — keep in sync

export type ActivityEventType =
  // Group lifecycle
  | "group.created"
  | "group.updated"
  | "group.activated"
  | "group.completed"
  | "group.paused"
  // Member actions
  | "member.joined"
  | "member.left"
  | "member.removed"
  | "member.role_changed"
  // Contributions
  | "contribution.made"
  | "contribution.missed"
  | "contribution.late"
  // Distributions / payouts
  | "distribution.scheduled"
  | "distribution.completed"
  | "distribution.failed"
  // Disputes
  | "dispute.filed"
  | "dispute.vote_cast"
  | "dispute.resolved"
  | "dispute.escalated"
  // Wallet / blockchain
  | "wallet.connected"
  | "transaction.confirmed"
  | "transaction.failed";

export interface ActivityActor {
  userId: string;
  displayName: string;
  walletAddress?: string;
  avatarUrl?: string;
}

export interface ActivityMetadata {
  groupId?: string;
  groupName?: string;
  amount?: string;
  currency?: string;
  contributionRound?: number;
  recipientUserId?: string;
  recipientDisplayName?: string;
  disputeId?: string;
  disputeReason?: string;
  resolution?: string;
  txHash?: string;
  txLedger?: number;
  oldRole?: string;
  newRole?: string;
  [key: string]: unknown;
}

export interface ActivityRecord {
  id: string;
  eventType: ActivityEventType;
  actor: ActivityActor;
  groupId: string;
  metadata: ActivityMetadata;
  createdAt: string; // ISO-8601
  txHash?: string;
}

export interface ActivityFeedResponse {
  activities: ActivityRecord[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
    nextCursor?: string;
  };
}

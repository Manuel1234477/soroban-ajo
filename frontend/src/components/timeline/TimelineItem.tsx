"use client";

import React from "react";
import { clsx } from "clsx";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import type { ActivityRecord, ActivityEventType } from "@/types/activity.types";
import { TimelineIcon } from "./TimelineIcon";

// ─── Human-readable label per event type ─────────────────────────────────────

function buildLabel(record: ActivityRecord): string {
  const { actor, metadata } = record;
  const name = actor.displayName;
  const amount = metadata.amount
    ? `${metadata.amount} ${metadata.currency ?? "XLM"}`
    : null;

  const labels: Record<ActivityEventType, string> = {
    "group.created":          `${name} created the group`,
    "group.updated":          `${name} updated group settings`,
    "group.activated":        `Group activated by ${name}`,
    "group.completed":        "Group cycle completed",
    "group.paused":           `Group paused by ${name}`,
    "member.joined":          `${name} joined the group`,
    "member.left":            `${name} left the group`,
    "member.removed":         `${name} was removed from the group`,
    "member.role_changed":    `${name}'s role changed to ${metadata.newRole ?? "member"}`,
    "contribution.made":      amount ? `${name} contributed ${amount}` : `${name} made a contribution`,
    "contribution.missed":    `${name} missed a contribution`,
    "contribution.late":      amount ? `${name} made a late contribution of ${amount}` : `${name} made a late contribution`,
    "distribution.scheduled": `Payout scheduled for ${metadata.recipientDisplayName ?? "a member"}`,
    "distribution.completed": amount
      ? `${metadata.recipientDisplayName ?? name} received ${amount}`
      : `${metadata.recipientDisplayName ?? name} received a payout`,
    "distribution.failed":    `Payout to ${metadata.recipientDisplayName ?? "a member"} failed`,
    "dispute.filed":          `${name} filed a dispute`,
    "dispute.vote_cast":      `${name} voted on a dispute`,
    "dispute.resolved":       "Dispute resolved",
    "dispute.escalated":      "Dispute escalated to admin",
    "wallet.connected":       `${name} connected a wallet`,
    "transaction.confirmed":  "Transaction confirmed on-chain",
    "transaction.failed":     "Transaction failed",
  };

  return labels[record.eventType] ?? record.eventType;
}

// ─── Timestamp formatting ─────────────────────────────────────────────────────

function formatTimestamp(iso: string): { relative: string; absolute: string } {
  const date = new Date(iso);
  const relative = formatDistanceToNow(date, { addSuffix: true });

  let absolute: string;
  if (isToday(date)) {
    absolute = `Today at ${format(date, "h:mm a")}`;
  } else if (isYesterday(date)) {
    absolute = `Yesterday at ${format(date, "h:mm a")}`;
  } else {
    absolute = format(date, "MMM d, yyyy · h:mm a");
  }

  return { relative, absolute };
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface TimelineItemProps {
  record: ActivityRecord;
  /** Whether to render the vertical connector line below this item */
  showConnector?: boolean;
  /** Animate in on mount */
  animate?: boolean;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const TimelineItem: React.FC<TimelineItemProps> = ({
  record,
  showConnector = true,
  animate = true,
  className,
}) => {
  const { relative, absolute } = formatTimestamp(record.createdAt);
  const label = buildLabel(record);
  const txHash = record.txHash ?? record.metadata.txHash as string | undefined;

  return (
    <li
      className={clsx(
        "flex gap-3 group",
        animate && "animate-fade-in-up",
        className
      )}
    >
      {/* Left column: icon + connector */}
      <div className="flex flex-col items-center flex-shrink-0">
        <TimelineIcon eventType={record.eventType} />
        {showConnector && (
          <span
            className="w-px flex-1 bg-surface-200 dark:bg-slate-700 my-1 min-h-[20px]"
            aria-hidden
          />
        )}
      </div>

      {/* Right column: content */}
      <div
        className={clsx(
          "flex-1 min-w-0 pb-4",
          !showConnector && "pb-0"
        )}
      >
        {/* Label */}
        <p className="text-sm text-surface-900 dark:text-slate-100 leading-snug">
          {label}
        </p>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
          {/* Relative timestamp with absolute on hover */}
          <time
            dateTime={record.createdAt}
            title={absolute}
            className="text-xs text-surface-400 dark:text-slate-500 cursor-default"
          >
            {relative}
          </time>

          {/* On-chain tx link */}
          {txHash && (
            <>
              <span className="text-surface-300 dark:text-slate-600 text-xs" aria-hidden>·</span>
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 hover:underline font-mono truncate max-w-[100px]"
                title={txHash}
                aria-label={`View transaction ${txHash} on Stellar Expert`}
              >
                {txHash.slice(0, 8)}…
              </a>
            </>
          )}

          {/* Contribution round badge */}
          {record.metadata.contributionRound != null && (
            <>
              <span className="text-surface-300 dark:text-slate-600 text-xs" aria-hidden>·</span>
              <span className="text-xs text-surface-400 dark:text-slate-500">
                Round {record.metadata.contributionRound}
              </span>
            </>
          )}
        </div>
      </div>
    </li>
  );
};

export default TimelineItem;

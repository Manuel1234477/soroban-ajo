"use client";

import React from "react";
import { clsx } from "clsx";
import type { ActivityEventType } from "@/types/activity.types";

// ─── Icon SVG paths keyed by event category ──────────────────────────────────

function GroupCreatedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function GroupCompletedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function GroupPausedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  );
}

function GroupUpdatedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function MemberJoinedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
}

function MemberLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
}

function MemberRemovedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="18" y1="8" x2="23" y2="13" />
      <line x1="23" y1="8" x2="18" y2="13" />
    </svg>
  );
}

function ContributionIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function ContributionMissedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function PayoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function PayoutScheduledIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function DisputeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
      <path d="M20 12V22H4V12" />
      <path d="M22 7H2v5h20V7z" />
      <path d="M12 22V7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}

function TransactionIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

// ─── Color + icon config per event type ──────────────────────────────────────

export interface TimelineIconConfig {
  icon: React.ReactNode;
  /** Tailwind bg + text classes for the icon bubble */
  colorClass: string;
  /** Tailwind ring color for the connector dot */
  ringClass: string;
}

const EVENT_ICON_MAP: Record<ActivityEventType, TimelineIconConfig> = {
  "group.created":          { icon: <GroupCreatedIcon />,    colorClass: "bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400",   ringClass: "ring-primary-200 dark:ring-primary-800" },
  "group.updated":          { icon: <GroupUpdatedIcon />,    colorClass: "bg-surface-100 text-surface-500 dark:bg-slate-800 dark:text-slate-400",           ringClass: "ring-surface-200 dark:ring-slate-700" },
  "group.activated":        { icon: <GroupCompletedIcon />,  colorClass: "bg-success-50 text-success-600 dark:bg-emerald-900/40 dark:text-emerald-400",     ringClass: "ring-success-100 dark:ring-emerald-800" },
  "group.completed":        { icon: <GroupCompletedIcon />,  colorClass: "bg-accent-100 text-accent-600 dark:bg-purple-900/40 dark:text-purple-400",        ringClass: "ring-accent-200 dark:ring-purple-800" },
  "group.paused":           { icon: <GroupPausedIcon />,     colorClass: "bg-warning-50 text-warning-600 dark:bg-amber-900/40 dark:text-amber-400",         ringClass: "ring-warning-100 dark:ring-amber-800" },
  "member.joined":          { icon: <MemberJoinedIcon />,    colorClass: "bg-success-50 text-success-600 dark:bg-emerald-900/40 dark:text-emerald-400",     ringClass: "ring-success-100 dark:ring-emerald-800" },
  "member.left":            { icon: <MemberLeftIcon />,      colorClass: "bg-surface-100 text-surface-500 dark:bg-slate-800 dark:text-slate-400",           ringClass: "ring-surface-200 dark:ring-slate-700" },
  "member.removed":         { icon: <MemberRemovedIcon />,   colorClass: "bg-error-50 text-error-600 dark:bg-red-900/40 dark:text-red-400",                 ringClass: "ring-error-100 dark:ring-red-800" },
  "member.role_changed":    { icon: <GroupUpdatedIcon />,    colorClass: "bg-info-50 text-info-600 dark:bg-cyan-900/40 dark:text-cyan-400",                 ringClass: "ring-info-100 dark:ring-cyan-800" },
  "contribution.made":      { icon: <ContributionIcon />,    colorClass: "bg-success-50 text-success-600 dark:bg-emerald-900/40 dark:text-emerald-400",     ringClass: "ring-success-100 dark:ring-emerald-800" },
  "contribution.missed":    { icon: <ContributionMissedIcon />, colorClass: "bg-error-50 text-error-600 dark:bg-red-900/40 dark:text-red-400",              ringClass: "ring-error-100 dark:ring-red-800" },
  "contribution.late":      { icon: <ContributionMissedIcon />, colorClass: "bg-warning-50 text-warning-600 dark:bg-amber-900/40 dark:text-amber-400",      ringClass: "ring-warning-100 dark:ring-amber-800" },
  "distribution.scheduled": { icon: <PayoutScheduledIcon />, colorClass: "bg-info-50 text-info-600 dark:bg-cyan-900/40 dark:text-cyan-400",                ringClass: "ring-info-100 dark:ring-cyan-800" },
  "distribution.completed": { icon: <PayoutIcon />,          colorClass: "bg-success-50 text-success-600 dark:bg-emerald-900/40 dark:text-emerald-400",     ringClass: "ring-success-100 dark:ring-emerald-800" },
  "distribution.failed":    { icon: <ContributionMissedIcon />, colorClass: "bg-error-50 text-error-600 dark:bg-red-900/40 dark:text-red-400",              ringClass: "ring-error-100 dark:ring-red-800" },
  "dispute.filed":          { icon: <DisputeIcon />,         colorClass: "bg-warning-50 text-warning-600 dark:bg-amber-900/40 dark:text-amber-400",         ringClass: "ring-warning-100 dark:ring-amber-800" },
  "dispute.vote_cast":      { icon: <DisputeIcon />,         colorClass: "bg-info-50 text-info-600 dark:bg-cyan-900/40 dark:text-cyan-400",                 ringClass: "ring-info-100 dark:ring-cyan-800" },
  "dispute.resolved":       { icon: <GroupCompletedIcon />,  colorClass: "bg-success-50 text-success-600 dark:bg-emerald-900/40 dark:text-emerald-400",     ringClass: "ring-success-100 dark:ring-emerald-800" },
  "dispute.escalated":      { icon: <DisputeIcon />,         colorClass: "bg-error-50 text-error-600 dark:bg-red-900/40 dark:text-red-400",                 ringClass: "ring-error-100 dark:ring-red-800" },
  "wallet.connected":       { icon: <WalletIcon />,          colorClass: "bg-surface-100 text-surface-500 dark:bg-slate-800 dark:text-slate-400",           ringClass: "ring-surface-200 dark:ring-slate-700" },
  "transaction.confirmed":  { icon: <TransactionIcon />,     colorClass: "bg-success-50 text-success-600 dark:bg-emerald-900/40 dark:text-emerald-400",     ringClass: "ring-success-100 dark:ring-emerald-800" },
  "transaction.failed":     { icon: <TransactionIcon />,     colorClass: "bg-error-50 text-error-600 dark:bg-red-900/40 dark:text-red-400",                 ringClass: "ring-error-100 dark:ring-red-800" },
};

const FALLBACK_CONFIG: TimelineIconConfig = {
  icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  colorClass: "bg-surface-100 text-surface-500 dark:bg-slate-800 dark:text-slate-400",
  ringClass: "ring-surface-200 dark:ring-slate-700",
};

export function getTimelineIconConfig(eventType: ActivityEventType): TimelineIconConfig {
  return EVENT_ICON_MAP[eventType] ?? FALLBACK_CONFIG;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface TimelineIconProps {
  eventType: ActivityEventType;
  className?: string;
}

export const TimelineIcon: React.FC<TimelineIconProps> = ({ eventType, className }) => {
  const config = getTimelineIconConfig(eventType);
  return (
    <span
      className={clsx(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ring-2",
        config.colorClass,
        config.ringClass,
        className
      )}
    >
      {config.icon}
    </span>
  );
};

export default TimelineIcon;

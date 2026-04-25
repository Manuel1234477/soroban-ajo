"use client";

import React from "react";
import { clsx } from "clsx";
import { format } from "date-fns";
import type { ActivityEventType } from "@/types/activity.types";
import { useActivityTimeline } from "@/hooks/useActivityTimeline";
import { TimelineItem } from "./TimelineItem";

// ─── Filter config ────────────────────────────────────────────────────────────

interface FilterOption {
  label: string;
  value: ActivityEventType | "all";
}

const FILTER_OPTIONS: FilterOption[] = [
  { label: "All",           value: "all" },
  { label: "Joins",         value: "member.joined" },
  { label: "Contributions", value: "contribution.made" },
  { label: "Payouts",       value: "distribution.completed" },
  { label: "Disputes",      value: "dispute.filed" },
];

// ─── Date group header ────────────────────────────────────────────────────────

function DateGroupHeader({ date }: { date: string }) {
  return (
    <div className="flex items-center gap-3 py-2" role="separator" aria-label={date}>
      <span className="text-xs font-semibold text-surface-400 dark:text-slate-500 uppercase tracking-wide whitespace-nowrap">
        {date}
      </span>
      <span className="flex-1 h-px bg-surface-200 dark:bg-slate-700" aria-hidden />
    </div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function TimelineSkeleton() {
  return (
    <div className="space-y-4 px-4 py-3" aria-busy="true" aria-label="Loading timeline">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-200 dark:bg-slate-700 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3.5 bg-surface-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-surface-100 dark:bg-slate-800 rounded animate-pulse w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <span className="text-3xl mb-3" aria-hidden>📋</span>
      <p className="text-sm font-medium text-surface-700 dark:text-slate-300">
        {filtered ? "No matching activity" : "No activity yet"}
      </p>
      <p className="text-xs text-surface-400 dark:text-slate-500 mt-1">
        {filtered
          ? "Try selecting a different filter."
          : "Activity will appear here as your group gets started."}
      </p>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ActivityTimelineProps {
  groupId?: string;
  token: string;
  /** Max height with overflow scroll. Defaults to "500px". Pass "none" to disable. */
  maxHeight?: string;
  className?: string;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ActivityTimeline({
  groupId,
  token,
  maxHeight = "500px",
  className,
}: ActivityTimelineProps) {
  const [activeFilter, setActiveFilter] = React.useState<ActivityEventType | "all">("all");

  const eventTypes = activeFilter === "all" ? undefined : [activeFilter];

  const {
    activities,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    totalCount,
  } = useActivityTimeline({ groupId, token, eventTypes, limit: 25 });

  // ── Group activities by calendar date ──────────────────────────────────────
  const grouped = React.useMemo(() => {
    const map = new Map<string, typeof activities>();
    for (const activity of activities) {
      const key = format(new Date(activity.createdAt), "MMMM d, yyyy");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(activity);
    }
    return map;
  }, [activities]);

  const dateKeys = Array.from(grouped.keys());

  return (
    <section
      className={clsx(
        "rounded-xl border border-surface-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden flex flex-col",
        className
      )}
      aria-label="Group activity timeline"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100 dark:border-slate-800 flex-shrink-0">
        <h2 className="text-sm font-semibold text-surface-900 dark:text-slate-100">
          Activity Timeline
        </h2>
        {!isLoading && (
          <span className="text-xs text-surface-400 dark:text-slate-500">
            {totalCount} {totalCount === 1 ? "event" : "events"}
          </span>
        )}
      </div>

      {/* ── Filter tabs ── */}
      <div
        className="flex gap-1.5 px-4 py-2.5 border-b border-surface-100 dark:border-slate-800 overflow-x-auto flex-shrink-0 scrollbar-none"
        role="tablist"
        aria-label="Filter timeline by event type"
      >
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            role="tab"
            aria-selected={activeFilter === opt.value}
            onClick={() => setActiveFilter(opt.value)}
            className={clsx(
              "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
              activeFilter === opt.value
                ? "bg-primary-600 text-white"
                : "bg-surface-100 dark:bg-slate-800 text-surface-600 dark:text-slate-400 hover:bg-surface-200 dark:hover:bg-slate-700"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* ── Timeline body ── */}
      <div
        className="flex-1 overflow-y-auto"
        style={maxHeight !== "none" ? { maxHeight } : undefined}
      >
        {isLoading && <TimelineSkeleton />}

        {isError && (
          <div className="py-8 px-4 text-center">
            <p className="text-sm text-error-600 dark:text-red-400">
              Failed to load activity.
            </p>
            <p className="text-xs text-surface-400 dark:text-slate-500 mt-1">
              {error instanceof Error ? error.message : "Please try again."}
            </p>
          </div>
        )}

        {!isLoading && !isError && activities.length === 0 && (
          <EmptyState filtered={activeFilter !== "all"} />
        )}

        {!isLoading && !isError && activities.length > 0 && (
          <div className="px-4 pt-3">
            {dateKeys.map((dateKey) => {
              const items = grouped.get(dateKey)!;
              return (
                <React.Fragment key={dateKey}>
                  <DateGroupHeader date={dateKey} />
                  <ol aria-label={`Activities on ${dateKey}`}>
                    {items.map((activity, idx) => (
                      <TimelineItem
                        key={activity.id}
                        record={activity}
                        showConnector={idx < items.length - 1}
                        animate
                      />
                    ))}
                  </ol>
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* ── Load more ── */}
        {hasNextPage && (
          <div className="px-4 py-3 border-t border-surface-100 dark:border-slate-800">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="w-full text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
            >
              {isFetchingNextPage ? "Loading…" : "Load more"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default ActivityTimeline;

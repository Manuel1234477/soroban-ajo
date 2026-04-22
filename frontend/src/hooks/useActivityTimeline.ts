import { useInfiniteQuery } from "@tanstack/react-query";
import type { ActivityEventType, ActivityFeedResponse, ActivityRecord } from "@/types/activity.types";
import { backendApiClient } from "@/lib/apiClient";
import { apiPaths } from "@/lib/apiEndpoints";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseActivityTimelineParams {
  groupId?: string;
  userId?: string;
  eventTypes?: ActivityEventType[];
  limit?: number;
  token: string;
  enabled?: boolean;
}

interface UseActivityTimelineReturn {
  activities: ActivityRecord[];
  totalCount: number;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
}

// ─── Query builder ────────────────────────────────────────────────────────────

function buildPath(params: Omit<UseActivityTimelineParams, "token" | "enabled">, cursor?: string): string {
  const base = apiPaths.activity.feed(params.groupId);
  const url = new URL(base, "http://localhost");

  if (params.userId) url.searchParams.set("userId", params.userId);
  if (params.eventTypes?.length) url.searchParams.set("eventTypes", params.eventTypes.join(","));
  if (params.limit) url.searchParams.set("limit", String(params.limit));
  if (cursor) url.searchParams.set("before", cursor);

  return `${base}${url.search}`;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Fetches a group's activity feed with infinite-scroll pagination,
 * returning a flat list of ActivityRecord items grouped by the caller.
 *
 * @param params.groupId  - Scope to a specific group (omit for global feed)
 * @param params.userId   - Filter to a specific user's actions
 * @param params.eventTypes - Whitelist of event types to include
 * @param params.limit    - Page size (default 25)
 * @param params.token    - JWT bearer token
 * @param params.enabled  - Pause the query (default true)
 */
export function useActivityTimeline({
  token,
  enabled = true,
  limit = 25,
  ...params
}: UseActivityTimelineParams): UseActivityTimelineReturn {
  const query = useInfiniteQuery<ActivityFeedResponse>({
    queryKey: ["activityTimeline", { ...params, limit }],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      backendApiClient.request<ActivityFeedResponse>({
        path: buildPath({ ...params, limit }, pageParam),
        bearerToken: token,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: ActivityFeedResponse) =>
      lastPage.pagination.hasMore ? lastPage.pagination.nextCursor : undefined,
    enabled: enabled && !!token,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const activities = query.data?.pages.flatMap((p: ActivityFeedResponse) => p.activities) ?? [];
  const totalCount = query.data?.pages[0]?.pagination.total ?? 0;

  return {
    activities,
    totalCount,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
  };
}

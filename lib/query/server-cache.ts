import { QueryClient, InfiniteData } from '@tanstack/react-query'
import { ServerPaginationResponse, ServerSummary } from '@/types/api/server'

type ServersInfiniteData = InfiniteData<ServerPaginationResponse>
type ServerUnreadData = Record<string, number>

export const SERVER_QUERY_KEY = ['servers'] as const
export const serverUnreadQueryKey = (serverId: string) => ['server-unread', serverId] as const

/**
 * Invalidate the servers list so it re-fetches.
 * Used after: create, edit, delete, leave server.
 */
export async function invalidateServers(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: SERVER_QUERY_KEY })
}

/**
 * Set a specific server's unread count to an absolute value.
 * Used for: socket "server:unread-update" event.
 */
export function setServerUnreadCount(
  queryClient: QueryClient,
  serverId: string,
  totalUnread: number,
): void {
  queryClient.setQueryData<ServersInfiniteData>(SERVER_QUERY_KEY, (old) => {
    if (!old) return old
    return {
      ...old,
      pages: old.pages.map((page: ServerPaginationResponse) => ({
        ...page,
        data: page.data.map((server: ServerSummary) =>
          server.id === serverId ? { ...server, unreadCount: totalUnread } : server,
        ),
      })),
    }
  })
}

/**
 * Increment a specific server's unread count.
 * Used for: socket "channel:notification" event.
 */
export function incrementServerUnreadCount(
  queryClient: QueryClient,
  serverId: string,
  inc: number,
): void {
  queryClient.setQueryData<ServersInfiniteData>(SERVER_QUERY_KEY, (old) => {
    if (!old) return old
    return {
      ...old,
      pages: old.pages.map((page: ServerPaginationResponse) => ({
        ...page,
        data: page.data.map((server: ServerSummary) =>
          server.id === serverId
            ? { ...server, unreadCount: (server.unreadCount ?? 0) + inc }
            : server,
        ),
      })),
    }
  })
}

/**
 * Replace per-channel unread map for a server.
 * Used after initial unread fetch.
 */
export function setServerUnreadMap(
  queryClient: QueryClient,
  serverId: string,
  unreadMap: ServerUnreadData,
): void {
  queryClient.setQueryData<ServerUnreadData>(serverUnreadQueryKey(serverId), unreadMap)
}

/**
 * Increment unread count for a specific channel in a server.
 * Used for: socket "channel:notification" event.
 */
export function incrementServerChannelUnread(
  queryClient: QueryClient,
  serverId: string,
  channelId: string,
  inc: number,
): void {
  const normalizedInc = Number(inc)
  if (!Number.isFinite(normalizedInc) || normalizedInc <= 0) return

  queryClient.setQueryData<ServerUnreadData>(serverUnreadQueryKey(serverId), (old) => {
    const prev = old ?? {}
    return {
      ...prev,
      [channelId]: (prev[channelId] ?? 0) + normalizedInc,
    }
  })
}

/**
 * Mark a specific channel as read in a server unread map.
 * Used for: socket "channel:mark-read" event.
 */
export function markServerChannelRead(
  queryClient: QueryClient,
  serverId: string,
  channelId: string,
): void {
  queryClient.setQueryData<ServerUnreadData>(serverUnreadQueryKey(serverId), (old) => {
    const prev = old ?? {}
    return {
      ...prev,
      [channelId]: 0,
    }
  })
}

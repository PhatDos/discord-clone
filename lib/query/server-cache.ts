import { QueryClient, InfiniteData } from '@tanstack/react-query'
import { ServerPaginationResponse, ServerSummary } from '@/types/api/server'

type ServersInfiniteData = InfiniteData<ServerPaginationResponse>

export const SERVER_QUERY_KEY = ['servers'] as const

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

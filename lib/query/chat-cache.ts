import { QueryClient, InfiniteData } from '@tanstack/react-query'

// ─── Key factory ────────────────────────────────────────────────────────────

export const chatQueryKey = (id: string) => `chat:${id}`

// ─── Minimal type constraints ────────────────────────────────────────────────

type HasId = { id: string }

type ChatPage<T> = { items: T[]; [key: string]: unknown }
type ChatData<T> = InfiniteData<ChatPage<T>>

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Insert a message at the top of the first page.
 * Used for: optimistic sends, AI responses, socket "add new message".
 */
export function insertMessage<T extends HasId>(
  queryClient: QueryClient,
  queryKey: string,
  message: T,
): void {
  queryClient.setQueryData<ChatData<T>>([queryKey], (old) => {
    if (!old || !old.pages || old.pages.length === 0) {
      return {
        pages: [{ items: [message], nextCursor: null }],
        pageParams: [null],
      } as ChatData<T>
    }
    const pages = [...old.pages]
    pages[0] = { ...pages[0], items: [message, ...pages[0].items] }
    return { ...old, pages }
  })
}

/**
 * Replace an optimistic placeholder (by tempId) with the confirmed message,
 * or insert at the top if the placeholder isn't found (message from another user).
 * Used for: socket "create" events in messages components.
 */
export function replaceOrInsertMessage<T extends HasId>(
  queryClient: QueryClient,
  queryKey: string,
  message: T,
  tempId?: string,
): void {
  queryClient.setQueryData<ChatData<T>>([queryKey], (old) => {
    if (!old) return old

    let replaced = false

    const pages = old.pages.map((page) => ({
      ...page,
      items: page.items.map((item) => {
        if (tempId && item.id === tempId) {
          replaced = true
          return { ...message, status: 'sent' } as T
        }
        return item
      }),
    }))

    if (!replaced) {
      pages[0] = { ...pages[0], items: [{ ...message, status: 'sent' } as T, ...pages[0].items] }
    }

    return { ...old, pages }
  })
}

/**
 * Update a message in the cache by matching id.
 * Used for: socket "update" events.
 */
export function updateMessage<T extends HasId>(
  queryClient: QueryClient,
  queryKey: string,
  updatedMessage: T,
): void {
  queryClient.setQueryData<ChatData<T>>([queryKey], (old) => {
    if (!old) return old
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        items: page.items.map((item) =>
          item.id === updatedMessage.id ? updatedMessage : item,
        ),
      })),
    }
  })
}

/**
 * Soft-delete a message: marks deleted, clears file fields, replaces content.
 * Used for: socket "delete" events.
 */
export function deleteMessage<T extends HasId>(
  queryClient: QueryClient,
  queryKey: string,
  id: string,
  content = 'This message has been deleted',
): void {
  queryClient.setQueryData<ChatData<T>>([queryKey], (old) => {
    if (!old) return old
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        items: page.items.map((item) =>
          item.id === id
            ? ({ ...item, deleted: true, fileUrl: null, fileType: undefined, content } as T)
            : item,
        ),
      })),
    }
  })
}

import type { ClientApi } from '@/services/client-api'

export const getAiUnreadSummary = async (
  api: ClientApi,
  channelId: string
) => {
  return api.get<unknown>(`/ai/${channelId}/unread-summary`)
}

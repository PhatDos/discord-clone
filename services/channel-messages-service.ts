import { fetchWithAuth } from "@/lib/server-api-client";

export const getChannelMessages = async (
  channelId: string,
  cursor?: string | null,
) => {
  const response = await fetchWithAuth((client, config) =>
    client.get("/channel-messages", {
      ...config,
      params: {
        channelId,
        ...(cursor ? { cursor } : {}),
      },
    }),
  );

  return response.data;
};
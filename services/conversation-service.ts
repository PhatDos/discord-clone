import { fetchWithAuth } from "@/lib/server-api-client";

export const getOrCreateConversation = async (profileBId: string) => {
  try {
    const response = await fetchWithAuth((client, config) =>
      client.post(
        "/direct-message/conversations/create-or-get",
        { otherProfileId: profileBId },
        config
      )
    );
    return response.data;
  } catch (error) {
    console.error("[getOrCreateConversation] error", error);
    return null;
  }
};

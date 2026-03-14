import { fetchWithAuth } from "@/lib/server-api-client";
import type { Conversation, Profile } from "@prisma/client";

export type ConversationWithProfiles = Conversation & {
  profileOne: Profile;
  profileTwo: Profile;
};

interface ConversationsListResponse {
  conversations: ConversationWithProfiles[];
}

interface InitialConversationResponse {
  conversation: ConversationWithProfiles | null;
  otherProfile: Profile | null;
}

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

export const getConversationsList = async () => {
  const response = await fetchWithAuth((client, config) =>
    client.get<ConversationsListResponse>(
      "/direct-message/conversations/list",
      config
    )
  );

  return response.data.conversations;
};

export const getInitialConversation = async () => {
  try {
    const response = await fetchWithAuth((client, config) =>
      client.get<InitialConversationResponse>(
        "/direct-message/conversations/initial",
        config
      )
    );
    return response.data;
  } catch (error) {
    console.error("[getInitialConversation] error", error);
    return null;
  }
};

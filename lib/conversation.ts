import { db } from "./db";

export const getOrCreateConversation = async (
  profileAId: string,
  profileBId: string,
) => {
  const [profileOneId, profileTwoId] =
    profileAId < profileBId
      ? [profileAId, profileBId]
      : [profileBId, profileAId];

  try {
    let conversation = await getConversation(profileOneId, profileTwoId);

    if (!conversation) {
      conversation = await createConversation(profileOneId, profileTwoId);
    }

    return conversation;
  } catch (error) {
    console.error("[getOrCreateConversation] error", error);
    return null;
  }
};

const getConversation = async (profileOneId: string, profileTwoId: string) => {
  try {
    const conversation = await db.conversation.findUnique({
      where: { profileOneId_profileTwoId: { profileOneId, profileTwoId } },
    });
    return conversation;
  } catch (error) {
    console.error("[getConversation] error", error);
    return null;
  }
};

const createConversation = async (
  profileOneId: string,
  profileTwoId: string,
) => {
  try {
    const conversation = await db.conversation.create({
      data: { profileOneId, profileTwoId },
    });
    return conversation;
  } catch (error) {
    console.error("[createConversation] error", error);
    return null;
  }
};

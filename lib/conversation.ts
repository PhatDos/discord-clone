import { db } from "./db";

export const getOrCreateConversation = async (
  profileA: string,
  profileB: string,
) => {
  // Sort ID để Conversation unique
  const [profileOneId, profileTwoId] =
    profileA < profileB ? [profileA, profileB] : [profileB, profileA];

  let conversation = await findConversation(profileOneId, profileTwoId);

  if (!conversation) {
    conversation = await createNewConversation(profileOneId, profileTwoId);
  }

  return conversation;
};

const findConversation = async (profileOneId: string, profileTwoId: string) => {
  try {
    return await db.conversation.findFirst({
      where: {
        profileOneId,
        profileTwoId,
      },
      include: {
        profileOne: true,
        profileTwo: true,
      },
    });
  } catch {
    return null;
  }
};

const createNewConversation = async (
  profileOneId: string,
  profileTwoId: string,
) => {
  try {
    return await db.conversation.create({
      data: {
        profileOneId,
        profileTwoId,
      },
      include: {
        profileOne: true,
        profileTwo: true,
      },
    });
  } catch {
    return null;
  }
};

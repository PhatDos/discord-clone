import { db } from "./db";

export const getOrCreateConversation = async (
  memberAId: string,
  memberBId: string,
) => {
  // Sort ID để đảm bảo unique
  const [profileOneId, profileTwoId] =
    memberAId < memberBId ? [memberAId, memberBId] : [memberBId, memberAId];

  try {
    let conversation = await db.conversation.findFirst({
      where: { profileOneId, profileTwoId },
    });

    if (!conversation) {
      conversation = await db.conversation.create({
        data: { profileOneId, profileTwoId },
      });
    }

    return conversation;
  } catch (error) {
    console.error("[getOrCreateConversation] error", error);
    return null;
  }
};

// const findConversation = async (profileOneId: string, profileTwoId: string) => {
//   try {
//     return await db.conversation.findFirst({
//       where: {
//         profileOneId,
//         profileTwoId,
//       },
//       include: {
//         profileOne: true,
//         profileTwo: true,
//       },
//     });
//   } catch (error) {
//     console.error("[findConversation] error", error);
//     return null;
//   }
// };

// const createNewConversation = async (
//   profileOneId: string,
//   profileTwoId: string,
// ) => {
//   try {
//     const conversation = await db.conversation.create({
//       data: { profileOneId, profileTwoId },
//     });

//     return await db.conversation.findFirst({
//       where: { id: conversation.id },
//       include: { profileOne: true, profileTwo: true },
//     });
//   } catch (error) {
//     console.error("[createNewConversation] error", error);
//     return null;
//   }
// };

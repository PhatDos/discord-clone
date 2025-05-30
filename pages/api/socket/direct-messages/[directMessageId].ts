import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "@/types";
import { MemberRole } from "@prisma/client";
import { NextApiRequest } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponseServerIo,
) {
    if (req.method !== "DELETE" && req.method !== "PATCH" ){
        return res.status(405).json({error: "Method not found"});
    }

    try {
        const profile = await currentProfilePages(req);
        const { directMessageId, conversationId } = req.query;
        const {content} = req.body;

        if (!profile) {
            return res.status(401).json({error: "Unauthorized"});
        }

        if (!conversationId) {
            return res.status(400).json({error: "Conversation ID missing"});
        }

        const conversation = await db.conversation.findFirst({
            where: {
                id: conversationId as string,
                OR: [
                    {
                        memberOne: {
                            profileId: profile.id
                        }
                    },
                    {
                        memberTwo: {
                            profileId: profile.id
                        }
                    }
                ]
            },
            include: {
                memberOne: {
                    include: {
                        profile: true,
                    }
                },
                memberTwo: {
                    include: {
                        profile: true,
                    }
                }
            }
        })

        if (!conversation) {
            return res.status(404).json({error: "Conversation not found"});
        }

        const member = conversation.memberOne.profileId === profile.id ? conversation.memberOne : conversation.memberTwo;

        if (!member) {
            return res.status(404).json({error: "Member not found"});
        }

        let directMessage = await db.directMessage.findFirst({
            where: {
                id: directMessageId as string,
                conversationId: conversationId as string,
            },
            include: {
                member: {
                    include: {
                        profile: true,
                    }
                }
            }
        })

        if (!directMessage || directMessage.deleted) {
            return res.status(404).json({error: "Message not found"});
        }

        const isMessageOwner = directMessage.memberId === member.id;
        const isServerOwner = member.role === MemberRole.SERVEROWNER;
        const isViceServerOwner = member.role === MemberRole.VICESERVEROWNER;
        const canModify = isMessageOwner || isServerOwner || isViceServerOwner;

        if (!canModify) {
            return res.status(401).json({error: "Unauthorized"});
        }

        if (req.method === "DELETE") {
            directMessage = await db.directMessage.update({
                where: {
                    id: directMessageId as string,
                },
                data: {
                    fileUrl: null,
                    content: "This message has been deleted",
                    deleted: true,
                },
                include: {
                    member: {
                        include: {
                            profile: true,
                        }
                    }
                }
            })
        }

        if (req.method === "PATCH") {
            if (!isMessageOwner) {
                return res.status(401).json({error: "Unauthorized"});
            }

            directMessage = await db.directMessage.update({
                where: {
                    id: directMessageId as string,
                },
                data: {
                    content: content,
                },
                include: {
                    member: {
                        include: {
                            profile: true,
                        }
                    }
                }
            })
        }

        const updateKey = `chat:${conversationId}:messages:update`;

        res?.socket?.server?.io?.emit(updateKey, directMessage);

        return res.status(200).json(directMessage);

    } catch (err) {
        console.log("[MESSAGES_ID]", err);
        return res.status(500).json({error: "Internal Error"});
    }
}
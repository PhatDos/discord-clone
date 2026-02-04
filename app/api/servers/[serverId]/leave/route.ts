import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    {params}: {params: Promise<{serverId: string}>}
) {
    try {
        const { serverId } = await params;
        const profile = await currentProfile();

        if (!profile) {
            return new NextResponse("Unauthorized", {status: 401});
        }

        if (!serverId) {
            return new NextResponse("Server ID missing", {status: 400});
        }

        const server = await db.server.update({
            where: {
                id: serverId,
                profileId: {
                    not: profile.id
                },
                members: {
                    some: {
                        profileId: profile.id
                    }
                }
            },
            data: {
                members: {
                    deleteMany: {
                        profileId: profile.id
                    }
                }
            }
        });

        return NextResponse.json(server);
    } catch {
        //console.log("[SERVER_ID_LEAVE]", err);
        return new NextResponse("Internal Error", {status: 500});
    }   
}
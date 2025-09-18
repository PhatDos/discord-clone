import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { serverId } = await params;

    if (!serverId) {
      return new NextResponse("Server ID Missing", { status: 400 });
    }

    // Check if user is a member (or owner)
    const server = await db.server.findUnique({
      where: {
        id: serverId,
      },
      include: {
        members: true,
      },
    });

    if (!server || !server.members.some((m) => m.profileId === profile.id)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Update invite code
    const updatedServer = await db.server.update({
      where: {
        id: serverId,
      },
      data: {
        inviteCode: uuidv4(),
      },
    });

    return NextResponse.json(updatedServer);
  } catch (err) {
    console.error(
      `[SERVER_ID] Error updating invite code for server ${params.serverId}:`,
      err
    );
    return new NextResponse("Internal Error", { status: 500 });
  }
}

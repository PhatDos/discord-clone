import { NextResponse } from "next/server";
import { withRoute } from "@/lib/with-route";
import { getChannelMessages } from "@/services/channel-messages-service";

export const GET = withRoute(async (req: Request) => {
  const { searchParams } = new URL(req.url);

  const cursor = searchParams.get("cursor");
  const channelId = searchParams.get("channelId");

  if (!channelId) {
    return new NextResponse("Channel ID missing", { status: 400 });
  }

  const response = await getChannelMessages(channelId, cursor);

  return NextResponse.json(response);
}, "MESSAGES_GET");

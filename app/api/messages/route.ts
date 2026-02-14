import { NextResponse } from "next/server";
import { fetchWithAuth } from "@/lib/server-api-client";
import { withRoute } from "@/lib/with-route";

export const GET = withRoute(async (req: Request) => {
  const { searchParams } = new URL(req.url);

  const cursor = searchParams.get("cursor");
  const channelId = searchParams.get("channelId");

  if (!channelId) {
    return new NextResponse("Channel ID missing", { status: 400 });
  }

  const response = await fetchWithAuth((client, config) =>
    client.get("/channel-messages", {
      ...config,
      params: {
        channelId,
        ...(cursor ? { cursor } : {}),
      },
    })
  );

  return NextResponse.json(response.data);
}, "MESSAGES_GET");

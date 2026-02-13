import { NextResponse } from "next/server";
import { fetchWithAuth } from "@/lib/server-api-client";
import { withRoute } from "@/lib/with-route";

export const GET = withRoute(async (req: Request) => {
  const { searchParams } = new URL(req.url);

  const cursor = searchParams.get("cursor");
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    return new NextResponse("Conversation ID missing", { status: 400 });
  }

  const response = await fetchWithAuth((client, config) =>
    client.get("/direct-message", {
      ...config,
      params: {
        conversationId,
        ...(cursor ? { cursor } : {}),
      },
    })
  );

  return NextResponse.json(response.data);
}, "DIRECT_MESSAGES_GET");

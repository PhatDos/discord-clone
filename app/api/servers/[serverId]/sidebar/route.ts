import { NextResponse } from "next/server";
import { withRoute } from "@/lib/with-route";
import { getServerSidebarData } from "@/services/servers/servers-ssr-service";

export const GET = withRoute(
  async (req: Request, { params }: { params: Promise<{ serverId: string }> }) => {
    const { serverId } = await params;

    if (!serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    try {
      const data = await getServerSidebarData(serverId);
      return NextResponse.json(data);
    } catch (error) {
      console.error("[SERVERS_SIDEBAR_GET]", error);
      return new NextResponse("Internal error", { status: 500 });
    }
  },
  "SERVERS_SIDEBAR_GET"
);

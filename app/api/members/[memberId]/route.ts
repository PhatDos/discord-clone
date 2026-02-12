import { NextResponse } from "next/server";
import { deleteMember, updateMemberRole } from "@/services/members-service";
import { withRoute } from "@/lib/with-route";

export const DELETE = withRoute(
  async (
    req: Request,
    { params }: { params: Promise<{ memberId: string }> }
  ) => {
    const { memberId } = await params;
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");

    if (!memberId) {
      return new NextResponse("Member ID missing", { status: 400 });
    }

    if (!serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    const data = await deleteMember(memberId, serverId);
    return NextResponse.json(data);
  },
  "MEMBERS_ID_DELETE"
);

export const PATCH = withRoute(
  async (
    req: Request,
    { params }: { params: Promise<{ memberId: string }> }
  ) => {
    const { memberId } = await params;
    const { role } = await req.json();
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");

    if (!memberId) {
      return new NextResponse("Member ID missing", { status: 400 });
    }

    if (!serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    if (!role) {
      return new NextResponse("Role missing", { status: 400 });
    }

    const data = await updateMemberRole(memberId, serverId, role);
    return NextResponse.json(data);
  },
  "MEMBERS_ID_PATCH"
);

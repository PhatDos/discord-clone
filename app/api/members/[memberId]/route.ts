import { NextResponse } from "next/server";
import { fetchWithAuth } from "@/lib/server-api-client";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ memberId: string }> },
) {
  try {
    const { memberId } = await params;
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");

    if (!memberId) {
      return new NextResponse("Member ID missing", { status: 400 });
    }

    if (!serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    const response = await fetchWithAuth((client, config) =>
      client.delete(`/members/${memberId}`, {
        ...config,
        data: { serverId },
      })
    );

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const err = error as { response?: { status: number } };
    if (err.response?.status === 401) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    console.log("[MEMBERS_ID_DELETE]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ memberId: string }> },
) {
  try {
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

    const response = await fetchWithAuth((client, config) =>
      client.patch(`/members/${memberId}`, 
        { 
          serverId,
          role 
        },
        config
      )
    );

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const err = error as { response?: { status: number } };
    if (err.response?.status === 401) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    console.log("[MEMBERS_ID_PATCH]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

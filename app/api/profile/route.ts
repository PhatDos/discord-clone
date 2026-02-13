import { NextResponse } from "next/server";
import { currentProfile } from "@/services/current-profile";
import { withRoute } from "@/lib/with-route";

export const GET = withRoute(async () => {
  const profile = await currentProfile();
  return NextResponse.json(profile);
}, "CURRENT_PROFILE");

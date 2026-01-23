//console.log("[LIVEKIT API] File loaded");


import { AccessToken } from "livekit-server-sdk"
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    //console.log("[LIVEKIT API] Handler triggered");    
    const room = req.nextUrl.searchParams.get("room")
    const username = req.nextUrl.searchParams.get("username")
    //console.log("[LIVEKIT API] room:", room);
    //console.log("[LIVEKIT API] username:", username);
    //console.log("env:", {
    //     LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY,
    //     LIVEKIT_API_SECRET: process.env.LIVEKIT_API_SECRET,
    //     NEXT_PUBLIC_LIVEKIT_URL: process.env.NEXT_PUBLIC_LIVEKIT_URL,
    // });
    if (!room) {
        return NextResponse.json({err: 'Missing room'}, {status: 400});
    }
    else if (!username) {
        return NextResponse.json({err: 'Missing username'}, {status: 400});
    }
    
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
        return NextResponse.json({err: 'Server misconfigured'}, {status: 500});
    }

    const at = new AccessToken(apiKey, apiSecret, { identity: username});
    at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true});
    
    const jwt = await at.toJwt();
    //console.log("Generated JWT:", jwt);
    return NextResponse.json({ token: jwt });
    
}
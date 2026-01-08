"use client";

import { Badge } from "@/components/ui/badge";
import { useSocket } from "./providers/socket-provider";

export const SocketIndicator = () => {
    const {isConnected} = useSocket();

    if (!isConnected) {
        return (
            <Badge variant="outline" className="bg-red-600 text-white border-none">
                Failed: Disconnected
            </Badge>
        )
    }

    return (
        <Badge variant="outline" className="bg-emerald-600 text-white border-none">
            Live: Real-time
        </Badge>
    )
}
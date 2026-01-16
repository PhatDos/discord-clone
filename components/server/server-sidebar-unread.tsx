"use client";

import { useEffect, useState } from "react";
import { Channel, MemberRole, Server } from "@prisma/client";
import { useApiClient } from "@/hooks/use-api-client";
import { useSocket } from "@/components/providers/socket-provider";
import { ServerChannel } from "./server-channel";

interface ServerSidebarUnreadProps {
  textChannels: Channel[];
  server: Server;
  role?: MemberRole;
}

export function ServerSidebarUnread({
  textChannels,
  server,
  role,
}: ServerSidebarUnreadProps) {
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});
  const apiClient = useApiClient();
  const { socket } = useSocket();

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const response = await apiClient.get<Record<string, number>>(
          `/servers/${server.id}/unread`
        );
        setUnreadMap(response);
      } catch (error) {
        console.error("Failed to fetch unread counts:", error);
      }
    };

    fetchUnread();
  }, [server.id, apiClient]);

  useEffect(() => {
    if (!socket) return;

    const handler = ({
      channelId,
      inc,
    }: {
      channelId: string;
      inc: number;
    }) => {
      setUnreadMap((prev) => ({
        ...prev,
        [channelId]: (prev[channelId] ?? 0) + inc,
      }));
    };

    socket.on("channel:notification", handler);
    return () => {
      socket.off("channel:notification", handler);
    };
  }, [socket]);  

  return (
    <div className="space-y-[2px]">
      {textChannels.map((channel) => (
        <ServerChannel
          key={channel.id}
          channel={channel}
          role={role}
          server={server}
          unreadCount={unreadMap[channel.id] ?? 0}
        />
      ))}
    </div>
  );
}

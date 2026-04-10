"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MemberRole } from "@/types/api/member";
import { ChannelResponse as Channel } from "@/types/api/channel";
import { ServerResponse as Server } from "@/types/api/server";
import { useApiClient } from "@/hooks/use-api-client";
import { ServerChannel } from "./server-channel";
import { getServerUnread } from "@/services/servers/servers-service";
import {
  serverUnreadQueryKey,
  setServerUnreadMap,
} from "@/lib/query/server-cache";

interface ServerSidebarUnreadProps {
  textChannels: Channel[];
  server: Server;
  role?: MemberRole;
  enableSocketListeners?: boolean;
}

export function ServerSidebarUnread({
  textChannels,
  server,
  role,
  enableSocketListeners = true,
}: ServerSidebarUnreadProps) {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  const { data: unreadMap = {} } = useQuery({
    queryKey: serverUnreadQueryKey(server.id),
    queryFn: async () => {
      const response = await getServerUnread(apiClient, server.id);
      setServerUnreadMap(queryClient, server.id, response);
      return response;
    },
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  void enableSocketListeners;

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

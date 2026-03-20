'use client';

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/components/providers/socket-provider";

interface UseServerSidebarRefreshProps {
  serverId: string;
}

export const useServerSidebarRefresh = ({
  serverId,
}: UseServerSidebarRefreshProps) => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleServerRefresh = () => {
      queryClient.invalidateQueries({
        queryKey: ["server-sidebar", serverId],
      });
    };

    socket.on("channel:refetch", handleServerRefresh);

    return () => {
      socket.off("channel:refetch", handleServerRefresh);
    };
  }, [socket, serverId, queryClient]);
};

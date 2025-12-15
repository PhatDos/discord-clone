import { useQueryClient, InfiniteData } from "@tanstack/react-query";
import { useEffect } from "react";

import { useSocket } from "@/components/providers/socket-provider";
import { MessageWithMemberWithProfile, ChatMessageResponse } from "@/types";

type ChatSocketProps = {
  addKey: string;
  updateKey: string;
  queryKey: string;
};

export const useChatSocket = ({
  addKey,
  updateKey,
  queryKey,
}: ChatSocketProps) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.on(updateKey, (message: MessageWithMemberWithProfile) => {
      queryClient.setQueryData<InfiniteData<ChatMessageResponse>>(
        [queryKey],
        (oldData) => {
          if (!oldData) return oldData;

          const newPages = oldData.pages.map((page) => ({
            ...page,
            items: page.items.map((item) =>
              item.id === message.id ? message : item,
            ),
            nextCursor: page.nextCursor ?? null,
          }));

          return { ...oldData, pages: newPages };
        },
      );
    });

    socket.on(addKey, (message: MessageWithMemberWithProfile) => {
      queryClient.setQueryData<InfiniteData<ChatMessageResponse>>(
        [queryKey],
        (oldData) => {
          console.log("Old Dataaa", oldData);
          if (!oldData || !oldData.pages || oldData.pages.length === 0) {
            return {
              pages: [
                {
                  items: [message],
                  nextCursor: null,
                },
              ],
              pageParams: [null],
            };
          }

          const newData = [...oldData.pages];

          newData[0] = {
            ...newData[0],
            items: [message, ...newData[0].items],
          };

          return {
            ...oldData,
            pages: newData,
            pageParams: oldData.pageParams,
          };
        },
      );
    });

    return () => {
      socket.off(addKey);
      socket.off(updateKey);
    };
  }, [queryClient, addKey, queryKey, socket, updateKey]);
};

/* eslint-disable */
"use client";

import React, { useEffect, Fragment } from "react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/hooks/use-api-client";

import { Member } from "@prisma/client";
import { ChatWelcome } from "../chat-welcome";
import { ChannelChatItem } from "./channel-chat-item";
import { Loader2, ServerCrash } from "lucide-react";
import { useChatQuery } from "@/hooks/use-chat-query";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { useSocket } from "@/components/providers/socket-provider";
import { MessageWithMemberWithProfile } from "@/types";

const DATE_FORMAT = "d MMM yyyy, HH:mm";

interface ChannelChatMessagesProps {
  name: string;
  member: Member;
  chatId: string;
  apiUrl: string;
  socketQuery: { channelId: string; serverId: string };
}

export const ChannelChatMessages = ({
  name,
  member: currentMember,
  chatId,
  apiUrl,
  socketQuery,
}: ChannelChatMessagesProps) => {
  const queryClient = useQueryClient();
  const chatRef = React.useRef<HTMLDivElement>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const { socket } = useSocket();
  const apiClient = useApiClient();

  const queryKey = `chat:${chatId}`;

  useEffect(() => {
    queryClient.setQueryData(["servers"], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page: any) => ({
          ...page,
          data: page.data.map((server: any) =>
            server.id === socketQuery.serverId
              ? { ...server, unreadCount: 0 }
              : server
          ),
        })),
      };
    });
  }, [socketQuery.serverId, queryClient]);

  // Mark channel as read when component mounts
  useEffect(() => {
    const markAsRead = async () => {
      try {
        await apiClient.post(`/channel-messages/${chatId}/read`, {
          serverId: socketQuery.serverId,
        });
      } catch (error) {
        console.error("Failed to mark channel as read:", error);
      }
    };
    markAsRead();
  }, [chatId, socketQuery.serverId, apiClient]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useChatQuery({
      queryKey,
      apiUrl,
      paramKey: "channelId",
      paramValue: chatId,
    });

  const createHandler = ({
    message,
    tempId,
  }: {
    message: MessageWithMemberWithProfile;
    tempId?: string;
  }) => {
    queryClient.setQueryData([queryKey], (oldData: any) => {
      if (!oldData) return oldData;

      let replaced = false;

      const pages = oldData.pages.map((page: any) => ({
        ...page,
        items: page.items.map((item: any) => {
          if (tempId && item.id === tempId) {
            replaced = true;
            return { ...message, status: "sent" };
          }
          return item;
        }),
      }));

      // message từ user khác → insert
      if (!replaced) {
        pages[0].items.unshift({ ...message, status: "sent" });
      }

      return { ...oldData, pages };
    });
  };

  const updateHandler = (updatedMessage: MessageWithMemberWithProfile) => {
    queryClient.setQueryData([queryKey], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          items: page.items.map((msg: any) =>
            msg.id === updatedMessage.id ? updatedMessage : msg
          ),
        })),
      };
    });
  };

  const deleteHandler = ({ id, content }: { id: string; content?: string }) => {
    queryClient.setQueryData([queryKey], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          items: page.items.map((msg: any) =>
            msg.id === id
              ? {
                  ...msg,
                  deleted: true,
                  content: content ?? "This message has been deleted",
                }
              : msg
          ),
        })),
      };
    });
  };

  useEffect(() => {
    if (!socket) return;

    socket.emit("channel:join", { channelId: chatId });

    socket.on("channel:message", createHandler);
    socket.on("channel:message:update", updateHandler);
    socket.on("channel:message:delete", deleteHandler);

    const onConnect = () => {
      socket.emit("channel:join", { channelId: chatId });
    };

    socket.on("connect", onConnect);

    return () => {
      socket.emit("channel:leave", { channelId: chatId });

      socket.off("channel:message", createHandler);
      socket.off("channel:message:update", updateHandler);
      socket.off("channel:message:delete", deleteHandler);

      socket.off("connect", onConnect);
    };
  }, [socket, chatId]);

  useChatScroll({
    chatRef,
    bottomRef,
    loadMore: fetchNextPage,
    shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
    count: data?.pages?.[0]?.items?.length ?? 0,
  });

  if (status === "loading")
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading...</p>
      </div>
    );

  if (status === "error")
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <ServerCrash className="h-10 w-10 text-zinc-500 my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          There was an error while loading!
        </p>
      </div>
    );

  return (
    <div ref={chatRef} className="flex-1 flex flex-col py-4 overflow-y-auto">
      <div className="flex-1" />
      {!hasNextPage && <ChatWelcome type="channel" name={name} />}

      <div className="flex justify-center">
        {isFetchingNextPage ? (
          <Loader2 className="h-6 w-6 text-zinc-500 animate-spin my-4" />
        ) : (
          hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 text-xs my-4 dark:hover:text-zinc-300 transition"
            >
              Load previous messages
            </button>
          )
        )}
      </div>

      <div className="flex flex-col-reverse mt-auto">
        {data?.pages?.map((group, pageIndex) => (
          <Fragment key={pageIndex}>
            {group.items.map(
              (message: MessageWithMemberWithProfile, itemIndex: number) => (
                <ChannelChatItem
                  key={`${message.id}-${pageIndex}-${itemIndex}`}
                  currentMember={currentMember}
                  member={message.member}
                  id={message.id}
                  content={message.content}
                  fileUrl={message.fileUrl}
                  fileType={message.fileType}
                  deleted={message.deleted}
                  timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
                  isUpdated={message.updatedAt !== message.createdAt}
                  status={(message as any).status}
                  socketQuery={socketQuery}
                />
              )
            )}
          </Fragment>
        ))}
      </div>

      <div ref={bottomRef} />
    </div>
  );
};

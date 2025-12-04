/* eslint-disable */
"use client";

import React, { useEffect, Fragment } from "react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

import { Member, Message, Profile } from "@prisma/client";
import { ChatWelcome } from "./chat-welcome";
import { ChatItem } from "./chat-item";
import { Loader2, ServerCrash } from "lucide-react";
import { useChatQuery } from "@/hooks/use-chat-query";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { useSocket } from "@/components/providers/socket-provider";

const DATE_FORMAT = "d MMM yyyy, HH:mm";

type MessageWithMemberWithProfile = Message & {
  member: Member & { profile: Profile };
  fileType?: string;
};

interface ChatMessagesProps {
  name: string;
  member: Member;
  chatId: string;
  apiUrl: string;
  socketUrl: string;
  socketQuery: Record<string, string>;
  paramKey: "channelId" | "conversationId";
  paramValue: string;
  type: "channel" | "conversation";
}

export const ChatMessages = ({
  name,
  member: currentMember,
  chatId,
  apiUrl,
  socketUrl,
  socketQuery,
  paramKey,
  paramValue,
  type,
}: ChatMessagesProps) => {
  const queryClient = useQueryClient();
  const chatRef = React.useRef<HTMLDivElement>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const { socket } = useSocket();

  const queryKey = `chat:${chatId}`;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useChatQuery({
      queryKey,
      apiUrl,
      paramKey,
      paramValue,
    });

  // ============================
  // SOCKET HANDLERS
  // ============================
  const createHandler = (newMessage: MessageWithMemberWithProfile) => {
    queryClient.setQueryData([queryKey], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page: any, index: number) =>
          index === 0 ? { ...page, items: [newMessage, ...page.items] } : page,
        ),
      };
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
            msg.id === updatedMessage.id ? updatedMessage : msg,
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
              : msg,
          ),
        })),
      };
    });
  };
  // SOCKET JOIN + EVENT LISTENERS
  useEffect(() => {
    if (!socket) return;

    const joinRoom = () => {
      if (type === "conversation")
        socket.emit("conversation:join", { conversationId: chatId });
      else socket.emit("channel:join", { channelId: chatId });
    };

    const leaveRoom = () => {
      if (type === "conversation")
        socket.emit("conversation:leave", { conversationId: chatId });
      else socket.emit("channel:leave", { channelId: chatId });
    };

    joinRoom();
    socket.on("connect", joinRoom);

    // FIXED: Event mapping theo Gateway
    const messageEvent = type === "conversation" ? "dm:new" : "channel:message";
    const updateEvent =
      type === "conversation" ? "dm:update" : "channel:message:update";
    const deleteEvent =
      type === "conversation" ? "dm:delete" : "channel:message:delete";

    socket.on(messageEvent, createHandler);
    socket.on(updateEvent, updateHandler);
    socket.on(deleteEvent, deleteHandler);

    return () => {
      leaveRoom();
      socket.off("connect", joinRoom);
      socket.off(messageEvent, createHandler);
      socket.off(updateEvent, updateHandler);
      socket.off(deleteEvent, deleteHandler);
    };
  }, [socket, chatId, type, queryKey]);

  // ============================
  // SCROLL HOOK
  // ============================
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
      {!hasNextPage && <ChatWelcome type={type} name={name} />}

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
                <ChatItem
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
                  socketQuery={socketQuery}
                  type={type}
                />
              ),
            )}
          </Fragment>
        ))}
      </div>

      <div ref={bottomRef} />
    </div>
  );
};

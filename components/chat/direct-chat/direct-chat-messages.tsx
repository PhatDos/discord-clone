/* eslint-disable */
"use client";

import React, { useEffect, Fragment } from "react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

import { Member, Message, Profile } from "@prisma/client";
import { ChatWelcome } from "../chat-welcome";
import { DirectChatItem } from "./direct-chat-item";
import { Loader2, ServerCrash } from "lucide-react";
import { useChatQuery } from "@/hooks/use-chat-query";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { useSocket } from "@/components/providers/socket-provider";

const DATE_FORMAT = "d MMM yyyy, HH:mm";

type DirectMessageWithSender = {
  id: string;
  content: string;
  fileUrl: string | null;
  fileType?: string;
  senderId: string;
  conversationId: string;
  createdAt: Date;
  updatedAt: Date;
  deleted: boolean;
  sender: Profile;
};

interface DirectChatMessagesProps {
  name: string;
  profile: Profile;
  chatId: string;
  apiUrl: string;
  socketQuery: { conversationId: string; memberId: string };
}

export const DirectChatMessages = ({
  name,
  profile,
  chatId,
  apiUrl,
  socketQuery,
}: DirectChatMessagesProps) => {
  const queryClient = useQueryClient();
  const chatRef = React.useRef<HTMLDivElement>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const { socket } = useSocket();

  const queryKey = `chat:${chatId}`;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useChatQuery({
      queryKey,
      apiUrl,
      paramKey: "conversationId",
      paramValue: chatId,
    });

  const createHandler = (newMessage: DirectMessageWithSender) => {
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

  const updateHandler = (updatedMessage: DirectMessageWithSender) => {
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

  useEffect(() => {
    if (!socket) return;

    socket.emit("conversation:join", { conversationId: chatId });

    socket.on("dm:create", createHandler);
    socket.on("dm:update", updateHandler);
    socket.on("dm:delete", deleteHandler);

    return () => {
      socket.off("dm:create", createHandler);
      socket.off("dm:update", updateHandler);
      socket.off("dm:delete", deleteHandler);
    };
  }, [socket, queryKey]);

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
      {!hasNextPage && <ChatWelcome type="conversation" name={name} />}

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
              (message: DirectMessageWithSender, itemIndex: number) => (
                <DirectChatItem
                  key={`${message.id}-${pageIndex}-${itemIndex}`}
                  currentMember={profile}
                  sender={message.sender}
                  id={message.id}
                  content={message.content}
                  fileUrl={message.fileUrl}
                  fileType={message.fileType}
                  deleted={message.deleted}
                  timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
                  isUpdated={message.updatedAt !== message.createdAt}
                  socketQuery={socketQuery}
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

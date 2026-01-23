"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Member, Profile } from "@prisma/client";
import { UserAvatar } from "../../common/user-avatar";
import { ActionTooltip } from "../../common/action-tooltip";
import { Edit, Trash, ShieldAlert, ShieldCheck, FileIcon } from "lucide-react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useModal } from "@/hooks/use-modal-store";
import { useSocket } from "@/components/providers/socket-provider";
import Image from "next/image";
import { MessageStatus } from "@/types";

interface ChannelChatItemProps {
  id: string;
  content: string;
  member: Member & { profile: Profile };
  currentMember: Member;
  timestamp: string;
  fileUrl: string | null;
  fileType?: string;
  deleted: boolean;
  isUpdated: boolean;
  status?: MessageStatus;
  socketQuery: { channelId: string; serverId: string };
}

const roleIconMap = {
  GUEST: null,
  VICESERVEROWNER: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
  SERVEROWNER: <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />,
};

const formSchema = z.object({
  content: z.string().min(1),
});

export const ChannelChatItem = React.memo(
  ({
    id,
    content,
    member,
    currentMember,
    timestamp,
    fileUrl,
    fileType,
    deleted,
    isUpdated,
    status = "sent",
    socketQuery,
  }: ChannelChatItemProps) => {
    const { socket } = useSocket();
    const [isEditing, setIsEditing] = useState(false);
    const { onOpen } = useModal();

    const [localContent, setLocalContent] = useState(content);
    const [expanded, setExpanded] = useState(false);
    const contentRef = useRef<HTMLParagraphElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);
    useEffect(() => setLocalContent(content), [content]);

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: { content: localContent },
    });

    useEffect(() => {
      form.reset({ content: localContent });
    }, [localContent, form]);

    useEffect(() => {
      const handler = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsEditing(false);
      };
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }, []);

    useEffect(() => {
      if (!contentRef.current || expanded) return;

      const el = contentRef.current;
      setIsOverflowing(el.scrollHeight > el.clientHeight);
    }, [localContent, expanded]);

    useEffect(() => {
      setExpanded(false);
    }, [id]);

    const onSubmit = useCallback(
      (values: z.infer<typeof formSchema>) => {
        if (!socket) return;
        setLocalContent(values.content);
        setIsEditing(false);

        socket.emit("channel:message:update", {
          id,
          content: values.content,
          fileUrl,
          channelId: socketQuery.channelId,
        });
      },
      [socket, id, socketQuery.channelId, fileUrl]
    );

    const isOwner = currentMember.id === member.id;
    const isServerOwner = currentMember.role === "SERVEROWNER";
    const isViceServerOwner = currentMember.role === "VICESERVEROWNER";

    const canEditMessage = !deleted && isOwner && !fileUrl && status === "sent";
    const canDeleteMessage =
      !deleted && (isOwner || isServerOwner || isViceServerOwner);

    const isImage = fileUrl && fileType === "img";
    const isPDF = fileUrl && fileType === "pdf";

    const handleDelete = () => {
      onOpen("deleteMessage", {
        query: {
          messageId: id,
          channelId: socketQuery.channelId,
          chatType: "channel",
        },
      });
    };

    return (
      <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
        <div className="group flex gap-x-2 items-start w-full">
          <div className="cursor-pointer hover:drop-shadow-md transition">
            <UserAvatar src={member.profile.imageUrl} />
          </div>

          <div className="flex flex-col w-full">
            <div className="flex items-center gap-x-2">
              <div className="flex items-center">
                <p className="font-semibold text-sm hover:underline cursor-pointer">
                  {member.profile.name}
                </p>
                <ActionTooltip label={member.role}>
                  {roleIconMap[member.role]}
                </ActionTooltip>
              </div>

              {status === "sending" && (
                <span className="text-xs opacity-50">Sending…</span>
              )}

              {status === "sent" && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {timestamp}
                </span>
              )}
            </div>

            {isImage && (
              <a
                href={fileUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square rounded-md mt-2 overflow-hidden border flex items-center bg-secondary h-48 w-48"
              >
                <Image
                  src={fileUrl!}
                  alt={localContent}
                  fill
                  className="object-cover"
                />
              </a>
            )}

            {isPDF && (
              <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
                <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
                <a
                  href={fileUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
                >
                  PDF file
                </a>
              </div>
            )}

            {!fileUrl && !isEditing && (
              <p
                ref={contentRef}
                className={cn(
                  "text-sm text-zinc-600 dark:text-zinc-300 break-words break-all",
                  !expanded && "line-clamp-2",
                  deleted &&
                    "italic text-zinc-500 dark:text-zinc-400 text-xs mt-1"
                )}
              >
                {localContent}
                {!deleted &&
                  isUpdated &&
                  status === "sent" &&
                  !isEditing && (
                    <span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400">
                      (edited)
                    </span>
                  )}
              </p>
            )}

            {!fileUrl && !isEditing && (isOverflowing || expanded) && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="text-xs text-indigo-500 hover:underline mt-1 w-fit"
              >
                {expanded ? "Show less" : "Show more"}
              </button>
            )}

            {!fileUrl && isEditing && (
              <Form {...form}>
                <form
                  className="flex items-center w-full gap-x-2 pt-2"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            {...field}
                            disabled={form.formState.isSubmitting}
                            placeholder="Edited"
                            className="p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none focus-visible:ring-0 text-zinc-600 dark:text-zinc-200"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    size="sm"
                    variant="default"
                    disabled={form.formState.isSubmitting}
                  >
                    save
                  </Button>
                </form>
                <span className="text-[10px] mt-1 text-zinc-400">
                  press esc to cancel, enter to save
                </span>
              </Form>
            )}
          </div>
        </div>

        {canDeleteMessage && (
          <div className="hidden group-hover:flex items-center gap-x-2 absolute p-1 -top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm">
            {canEditMessage && (
              <ActionTooltip label="Edit">
                <Edit
                  onClick={() => setIsEditing(true)}
                  className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
                />
              </ActionTooltip>
            )}
            <ActionTooltip label="Delete">
              <Trash
                onClick={handleDelete}
                className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
              />
            </ActionTooltip>
          </div>
        )}
      </div>
    );
  }
);

ChannelChatItem.displayName = "ChannelChatItem";

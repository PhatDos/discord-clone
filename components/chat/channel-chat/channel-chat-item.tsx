"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MemberResponse as Member, MemberWithProfileResponse } from "@/types/api/member";
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
import { useTheme } from "next-themes";

interface ChannelChatItemProps {
  id: string;
  content: string;
  member?: MemberWithProfileResponse | null;
  currentMember: Member;
  timestamp: string;
  fileUrl: string | null;
  fileType?: string;
  deleted: boolean;
  isUpdated: boolean;
  status?: MessageStatus;
  socketQuery: { channelId: string; serverId: string };
  isFlagged?: boolean;
  flagReason?: string;
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
    isFlagged = false,
    flagReason = "",
  }: ChannelChatItemProps) => {
    const { socket } = useSocket();
    const { resolvedTheme } = useTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [isFlagRevealed, setIsFlagRevealed] = useState(false);
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
      [socket, id, socketQuery.channelId, fileUrl],
    );

    const memberId = member?.id ?? null;
    const memberRole = member?.role ?? null;
    const memberName = member?.profile?.name ?? "Former member";
    const fallbackAvatar =
      resolvedTheme === "dark" ? "/avatar-default-dark.svg" : "/avatar-default.svg";
    const memberImageUrl = member?.profile?.imageUrl ?? fallbackAvatar;
    const roleIcon = memberRole
      ? roleIconMap[memberRole as keyof typeof roleIconMap]
      : null;

    const isOwner =
      memberId !== null && (currentMember.id === memberId || memberId === "temp");
    const isServerOwner = currentMember.role === "SERVEROWNER";
    const isViceServerOwner = currentMember.role === "VICESERVEROWNER";

    const canEditMessage = !deleted && isOwner && !fileUrl && status === "sent";
    const canDeleteMessage =
      !deleted && (isOwner || isServerOwner || isViceServerOwner);

    const isImage = !deleted && fileUrl && fileType === "img";
    const isPDF = !deleted && fileUrl && fileType === "pdf";

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
      <div
        className={cn(
          "relative group flex items-center hover:bg-black/5 p-4 transition w-full",
          isOwner && "justify-end",
        )}
      >
        <div
          className={cn(
            "group flex gap-x-2 items-start w-full",
            isOwner && "flex-row-reverse",
          )}
        >
          <div className="cursor-pointer hover:drop-shadow-md transition">
            <UserAvatar src={memberImageUrl} />
          </div>

          <div
            className={cn(
              "flex flex-col w-full",
              isOwner && "items-end text-right",
            )}
          >
            <div
              className={cn(
                "flex items-center gap-x-2",
                isOwner && "flex-row-reverse",
              )}
            >
              <div
                className={cn(
                  "flex items-center",
                  isOwner && "flex-row-reverse",
                )}
              >
                <p className="font-semibold text-sm hover:underline cursor-pointer">
                  {isOwner ? "You" : memberName}
                </p>

                {roleIcon && (
                  <div className={cn(isOwner && "mr-2 -ml-2")}>
                    <ActionTooltip label={memberRole ?? ""}>
                      {roleIcon}
                    </ActionTooltip>
                  </div>
                )}
              </div>

              {status === "sending" && (
                <span className="text-xs opacity-50">Sending…</span>
              )}

              {status === "sent" && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {timestamp}
                </span>
              )}

              {canDeleteMessage && (
                <div className={cn("hidden group-hover:flex absolute top-1/2 -translate-y-1/2 items-center gap-x-2 p-1 bg-white dark:bg-zinc-800 border rounded-sm",
                    !isOwner ? "right-[3%]" : "left-[3%]",
                )}>
                  <ActionTooltip label="Delete">
                    <Trash
                      onClick={handleDelete}
                      className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
                    />
                  </ActionTooltip>
                  {canEditMessage && (
                    <ActionTooltip label="Edit">
                      <Edit
                        onClick={() => setIsEditing(true)}
                        className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
                      />
                    </ActionTooltip>
                  )}
                </div>
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
                  sizes="192px"
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
              <>
                {isFlagged && !isFlagRevealed && !deleted ? (
                  <div
                    onClick={() => setIsFlagRevealed(true)}
                    className={cn(
                      "text-sm px-3 py-1 rounded bg-red-100 dark:bg-red-950 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 cursor-pointer hover:bg-red-200 dark:hover:bg-red-900 transition break-words w-fit max-w-[70%]",
                      isOwner ? "self-end" : "self-start",
                    )}
                  >
                    <p className="text-xs">{"⚠️ " + (flagReason || "Negative content detected")}</p>
                    <p className="text-xs opacity-70">Click to reveal</p>
                  </div>
                ) : (
                  <p
                    ref={contentRef}
                    className={cn(
                      "text-sm text-zinc-600 dark:text-zinc-300 break-words break-all mr-1",
                      isOwner ? "ml-24" : "mr-24",
                      !expanded && "line-clamp-2",
                      deleted &&
                        "italic text-zinc-500 dark:text-zinc-400 text-xs mt-1",
                    )}
                  >
                    {localContent}
                    {!deleted && isUpdated && status === "sent" && !isEditing && (
                      <span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400">
                        (edited)
                      </span>
                    )}
                  </p>
                )}
              </>
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
                            className="p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none focus-visible:ring-0 text-zinc-600 dark:text-zinc-200 text-right"
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
      </div>
    );
  },
);

ChannelChatItem.displayName = "ChannelChatItem";

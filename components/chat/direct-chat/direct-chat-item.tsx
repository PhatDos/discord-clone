"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Profile } from "@prisma/client";
import { UserAvatar } from "../../common/user-avatar";
import { ActionTooltip } from "../../common/action-tooltip";
import { Edit, Trash, FileIcon } from "lucide-react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useModal } from "@/hooks/use-modal-store";
import { useSocket } from "@/components/providers/socket-provider";
import Image from "next/image";
import { MessageStatus } from "@/types";

const formSchema = z.object({ content: z.string().min(1) });

export const DirectChatItem = ({
  id,
  content,
  sender,
  currentMember,
  timestamp,
  fileUrl,
  fileType,
  deleted,
  isUpdated,
  status = "sent",
  socketQuery,
}: {
  id: string;
  content: string;
  sender: Profile;
  currentMember: Profile;
  timestamp: string;
  fileUrl?: string | null;
  fileType?: string;
  deleted: boolean;
  isUpdated: boolean;
  status?: MessageStatus;
  socketQuery: Record<string, string>;
}) => {
  const { socket } = useSocket();
  const { onOpen } = useModal();
  const [isEditing, setIsEditing] = useState(false);
  const [localContent, setLocalContent] = useState(content);
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { content },
  });

  useEffect(() => {
    setLocalContent(content);
    form.reset({ content });
  }, [content, form]);

  const onSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      if (!socket) return;

      setLocalContent(values.content);
      setIsEditing(false);

      socket.emit("dm:update", {
        id,
        content: values.content,
        conversationId: socketQuery.conversationId,
      });
    },
    [socket, id, socketQuery.conversationId],
  );

  useEffect(() => {
    if (!contentRef.current || expanded) return;

    const el = contentRef.current;
    setIsOverflowing(el.scrollHeight > el.clientHeight);
  }, [localContent, expanded]);

  useEffect(() => {
    setExpanded(false);
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isEditing) {
        setIsEditing(false);
        form.reset({ content: localContent });
      }
    };

    if (isEditing) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEditing, localContent, form]);

  const isOwner = currentMember.id === sender.id;
  const canEditMessage = !deleted && isOwner && !fileUrl && status === "sent";
  const canDeleteMessage = !deleted && isOwner && status === "sent" && !isEditing;
  const isImage = fileUrl && fileType === "img";
  const isPDF = fileUrl && fileType === "pdf";

  const handleDelete = () => {
    onOpen("deleteMessage", {
      query: {
        messageId: id,
        conversationId: socketQuery.conversationId,
        chatType: "conversation",
      },
    });
  };

  return (
    <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
      <div className="flex gap-x-2 items-start w-full">
        <UserAvatar src={sender.imageUrl} />

        <div className="flex flex-col w-full">
          <div className="flex items-center gap-x-2">
            <p className="font-semibold text-sm">{sender.name}</p>
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

          {!fileUrl && isEditing && status === "sent" && (
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

          {/* Render text message */}
          {!fileUrl && !isEditing && (
            <p
              ref={contentRef}
              className={cn(
                "text-sm text-zinc-600 dark:text-zinc-300 break-words break-all",
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

          {/* Button Show more/Show less */}
          {(isOverflowing || expanded) && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-xs text-indigo-500 hover:underline mt-1 w-fit"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
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
};

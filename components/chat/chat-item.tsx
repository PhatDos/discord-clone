/* eslint-disable */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Member, Profile } from "@prisma/client";

import { UserAvatar } from "../user-avatar";
import { ActionTooltip } from "../action-tooltip";
import { Edit, Trash, ShieldAlert, ShieldCheck, FileIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useModal } from "@/hooks/use-modal-store";
import { useSocket } from "@/components/providers/socket-provider";
import Image from "next/image";

interface ChatItemProps {
  id: string;
  content: string;
  member: Member & { profile: Profile };
  currentMember: Member;
  timestamp: string;
  fileUrl: string | null;
  fileType?: string;
  deleted: boolean;
  isUpdated: boolean;
  socketUrl: string;
  socketQuery: Record<string, string>;
  apiUrl: string;
}

const roleIconMap = {
  GUEST: null,
  VICESERVEROWNER: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
  SERVEROWNER: <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />,
};

const formSchema = z.object({ content: z.string().min(1) });

export const ChatItem = React.memo(
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
    socketQuery,
    apiUrl
  }: ChatItemProps) => {
    const { socket } = useSocket();
    const [ isEditing, setIsEditing ] = useState(false);
    const { onOpen } = useModal();

    //Render edit new msg instantly
    const [ localContent, setLocalContent ] = useState(content);
    useEffect(() => {
      setLocalContent(content);
    }, [ content ]);


    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: { content: localContent },
    });

    useEffect(
      () => form.reset({ content: localContent }),
      [ localContent, form ],
    );

    useEffect(() => {
      const handler = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsEditing(false);
      };
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }, []);

    const onSubmit = useCallback(
      (values: z.infer<typeof formSchema>) => {
        if (!socket) return;
        setLocalContent(values.content); // render ngay
        setIsEditing(false);
        socket.emit("message:update", {
          id,
          content: values.content,
          conversationId: socketQuery.conversationId,
        });
      },
      [ socket, id, socketQuery.conversationId ],
    );

    const isOwner = currentMember.id === member.id;
    const isServerOwner = currentMember.role === "SERVEROWNER";
    const isViceServerOwner = currentMember.role === "VICESERVEROWNER";
    const canEditMessage = !deleted && isOwner && !fileUrl;
    const canDeleteMessage =
      !deleted && (isOwner || isServerOwner || isViceServerOwner);
    const isImage = fileUrl && fileType === "img";
    const isPDF = fileUrl && fileType === "pdf";

    const onMemberClick = useCallback(() => {
      if (member.id !== currentMember.id) return;
      // navigate if needed
    }, [ member.id, currentMember.id ]);

    return (
      <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
        <div className="group flex gap-x-2 items-start w-full">
          <div
            onClick={onMemberClick}
            className="cursor-pointer hover:drop-shadow-md transition"
          >
            <UserAvatar src={member.profile.imageUrl} />
          </div>

          <div className="flex flex-col w-full">
            <div className="flex items-center gap-x-2">
              <div className="flex items-center">
                <p className="font-semibold text-sm hover:underline cursor-pointer">
                  {member.profile.name}
                </p>
                <ActionTooltip label={member.role}>
                  {roleIconMap[ member.role ]}
                </ActionTooltip>
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {timestamp}
              </span>
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
                className={cn(
                  "text-sm text-zinc-600 dark:text-zinc-300",
                  deleted && "italic text-zinc-500 dark:text-zinc-400 text-xs mt-1",
                )}
              >
                {localContent}
                {!deleted && isUpdated && !isEditing && (
                  <span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400">
                    (edited)
                  </span>
                )}
              </p>
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
                onClick={() =>
                  onOpen("deleteMessage", {
                    query: { messageId: id, conversationId: socketQuery.conversationId },
                  })
                }
                className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
              />
            </ActionTooltip>
          </div>
        )}
      </div>
    );
  },
);

"use client";

import { useSocket } from "@/components/providers/socket-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import { Button } from "../ui/button";
import { useState } from "react";

export const DeleteMessageModal = () => {
  const { socket } = useSocket();
  const { isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === "deleteMessage";

  // Get data from modal store
  const { query } = data || {};
  const messageId = query?.messageId;
  const conversationId = query?.conversationId;
  const channelId = query?.channelId;
  const chatType = query?.chatType;

  const [isLoading, setIsLoading] = useState(false);

  const onClick = () => {
    if (!socket || !messageId) return;

    setIsLoading(true);

    const handleAfterDelete = () => {
      setIsLoading(false);
      onClose();
    };

    if (chatType === "conversation" && conversationId) {
      // Nếu backend hỗ trợ ack callback
      socket.emit(
        "message:delete",
        { id: messageId, conversationId },
        handleAfterDelete,
      );
    } else if (chatType === "channel" && channelId) {
      socket.emit(
        "channel:message:delete",
        { id: messageId, channelId },
        handleAfterDelete,
      );
    } else {
      // fallback nếu không có callback
      setTimeout(handleAfterDelete, 300);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black text-white overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Delete Message?
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Are you sure you want to delete this message?
            <br />
            It will be removed permanently.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="px-6 py-1">
          <div className="flex items-center justify-between w-full">
            <Button disabled={isLoading} onClick={onClose} variant="ghost">
              Cancel
            </Button>
            <Button disabled={isLoading} variant="default" onClick={onClick}>
              {isLoading ? "Deleting..." : "Confirm"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

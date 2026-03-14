import {Server as NetServer, Socket} from "net";
import { NextApiResponse } from "next";
import {Server as SocketIOServer } from "socket.io"
import type {
  DirectMessage as ApiDirectMessage,
  DirectMessagePage as ApiDirectMessagePage,
  DirectMessageResponse as ApiDirectMessageResponse,
  MessageWithMemberWithProfile as ApiMessageWithMemberWithProfile,
} from "@/types/api/message";
import type { ServerWithMembersWithProfiles as ApiServerWithMembersWithProfiles } from "@/types/api/server";

export type ServerWithMembersWithProfiles = ApiServerWithMembersWithProfiles;

export type NextApiResponseServerIo = NextApiResponse & {
    socket: Socket & {
        server: NetServer & {
            io: SocketIOServer
        };
    };
};

// Chat & Message Types
export type MessageWithMemberWithProfile = ApiMessageWithMemberWithProfile;

export type OptimisticMessage = {
  id: string;
  content: string;
  fileUrl?: string;
  fileType?: string;
  member: {
    id: string;
    profile: {
      userId: string;
      name: string;
      imageUrl: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
  deleted: boolean;
  status?: string;
  isOptimistic?: boolean;
};

export type ChatMessageResponse = {
  items: (MessageWithMemberWithProfile | OptimisticMessage)[];
  nextCursor: string | null;
};

export type DirectMessage = ApiDirectMessage;

export type DirectMessagePage = ApiDirectMessagePage;

export type DirectMessageResponse = ApiDirectMessageResponse;

export type MessageStatus = "sending" | "sent" | "error";
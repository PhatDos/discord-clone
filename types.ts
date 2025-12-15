import { Server, Member, Profile, Message } from "@prisma/client";
import {Server as NetServer, Socket} from "net";
import { NextApiResponse } from "next";
import {Server as SocketIOServer } from "socket.io"

export type ServerWithMembersWithProfiles = Server & {
    members: (Member & {profile: Profile}) [];
};

export type NextApiResponseServerIo = NextApiResponse & {
    socket: Socket & {
        server: NetServer & {
            io: SocketIOServer
        };
    };
};

// Chat & Message Types
export type MessageWithMemberWithProfile = Message & {
  member: Member & {
    profile: Profile;
  };
  fileType?: string;
};

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

export type DirectMessage = {
  id: string;
  tempId?: string;
  content: string;
  fileUrl: string | null;
  fileType: string;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  sender: Profile;
  status?: "sending" | "sent" | "failed";
};

export type DirectMessagePage = {
  items: DirectMessage[];
};

export type DirectMessageResponse = {
  pages: DirectMessagePage[];
  pageParams?: unknown[];
};

export type MessageStatus = "sending" | "sent" | "error";
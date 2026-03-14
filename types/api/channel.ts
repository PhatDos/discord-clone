import type { ApiDateTime } from "@/types/api/member";

export enum ChannelType {
  TEXT = "TEXT",
  AUDIO = "AUDIO",
  VIDEO = "VIDEO",
}

export interface ChannelResponse {
  id: string;
  name: string;
  type: ChannelType;
  profileId: string;
  serverId: string;
  createdAt: ApiDateTime;
  updatedAt: ApiDateTime;
}

export interface InitialChannelResponse {
  channelId: string;
  channelName: string;
}

export interface ChannelReadResponse {
  id: string;
  memberId: string;
  channelId: string;
  lastReadAt: string;
  formerLastReadAt: string | null;
  isNotify: boolean;
}

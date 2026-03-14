import type { ChannelResponse } from "@/types/api/channel";
import type {
  ApiDateTime,
  MemberResponse,
  MemberRole,
  MemberWithProfileResponse,
} from "@/types/api/member";

export interface ServerResponse {
  id: string;
  name: string;
  imageUrl: string;
  inviteCode: string;
  profileId: string;
  createdAt: ApiDateTime;
  updatedAt: ApiDateTime;
}

export type InitialServerResponse = ServerResponse | null;

export interface ServerSummary {
  id: string;
  name: string;
  imageUrl: string;
  unreadCount?: number;
}

export interface ServerPaginationResponse {
  data: ServerSummary[];
  total: number;
  skip: number;
  limit: number;
  totalPages: number;
}

export type ServerUnreadResponse = Record<string, number>;

export interface CurrentProfileResponse {
  id: string;
}

export interface ServerWithMembersWithProfiles extends ServerResponse {
  members: MemberWithProfileResponse[];
}

export interface ServerMeResponse {
  member: MemberResponse;
}

export interface ServerSidebarResponse {
  server: ServerResponse & {
    channels: ChannelResponse[];
    members: MemberWithProfileResponse[];
  };
  textChannels: ChannelResponse[];
  audioChannels: ChannelResponse[];
  videoChannels: ChannelResponse[];
  members: MemberWithProfileResponse[];
  role: MemberRole;
}

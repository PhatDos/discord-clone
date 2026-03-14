'use server';

import type { Channel, Member, MemberRole, Profile, Server } from "@prisma/client";
import { fetchWithAuth } from "@/lib/server-api-client";

export interface ServerSidebarData {
  server: Server & { channels: Channel[]; members: (Member & { profile: Profile })[] };
  textChannels: Channel[];
  audioChannels: Channel[];
  videoChannels: Channel[];
  members: (Member & { profile: Profile })[];
  role: MemberRole;
}

export interface InitialChannelResponse {
  channelId: string;
  channelName: string;
}

export interface ServerMeResponse {
  member: Member & { role: MemberRole };
}

// Server-side only functions (for Server Components)
export const getInitialServer = async () => {
  const response = await fetchWithAuth((client, config) =>
    client.get<Server | null>("/servers/initial", config)
  );
  return response.data;
};

export const getInitialChannel = async (serverId: string) => {
  const response = await fetchWithAuth((client, config) =>
    client.get<InitialChannelResponse>(
      `/servers/${serverId}/initial-channel`,
      config
    )
  );
  return response.data;
};

export const getChannel = async (serverId: string, channelId: string) => {
  const response = await fetchWithAuth((client, config) =>
    client.get<Channel>(`/servers/${serverId}/channels/${channelId}`, config)
  );
  return response.data;
};

export const getServerMe = async (serverId: string) => {
  const response = await fetchWithAuth((client, config) =>
    client.get<ServerMeResponse>(`/servers/${serverId}/me`, config)
  );
  return response.data;
};

export const getServerSidebarData = async (serverId: string) => {
  const response = await fetchWithAuth((client, config) =>
    client.get<ServerSidebarData>(`/servers/${serverId}/sidebar`, config)
  );
  return response.data;
};

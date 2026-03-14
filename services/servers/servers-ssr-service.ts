'use server';

import type {
  ChannelResponse,
  InitialChannelResponse,
} from "@/types/api/channel";
import type {
  InitialServerResponse,
  ServerMeResponse,
  ServerSidebarResponse,
} from "@/types/api/server";
import { fetchWithAuth } from "@/lib/server-api-client";

// Server-side only functions (for Server Components)
export const getInitialServer = async () => {
  const response = await fetchWithAuth((client, config) =>
    client.get<InitialServerResponse>("/servers/initial", config)
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
    client.get<ChannelResponse>(`/servers/${serverId}/channels/${channelId}`, config)
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
    client.get<ServerSidebarResponse>(`/servers/${serverId}/sidebar`, config)
  );
  return response.data;
};

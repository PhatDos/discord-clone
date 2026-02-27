import type { ClientApi } from "@/services/client-api";

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

export interface ServerPayload {
  id: string;
  name: string;
  imageUrl?: string;
  inviteCode?: string;
}

export const getServerUnread = async (api: ClientApi, serverId: string) => {
  return api.get<Record<string, number>>(`/servers/${serverId}/unread`);
};

export const getServers = async (
  api: ClientApi,
  skip: number,
  limit: number,
) => {
  return api.get<ServerPaginationResponse>(`/servers?skip=${skip}&limit=${limit}`);
};

export const createServer = async (
  api: ClientApi,
  values: { name: string; imageUrl: string },
) => {
  return api.post<ServerPayload>("/servers", values);
};

export const updateServer = async (
  api: ClientApi,
  serverId: string,
  values: { name: string; imageUrl: string },
) => {
  return api.patch(`/servers/${serverId}`, values);
};

export const deleteServer = async (api: ClientApi, serverId: string) => {
  return api.delete(`/servers/${serverId}`);
};

export const leaveServer = async (api: ClientApi, serverId: string) => {
  return api.patch(`/servers/${serverId}/leave`);
};

export const refreshServerInviteCode = async (
  api: ClientApi,
  serverId: string,
) => {
  return api.patch<ServerPayload>(`/servers/${serverId}/invite-code`);
};

export const joinServerByInviteCode = async (
  api: ClientApi,
  inviteCode: string,
) => {
  return api.post<ServerPayload>(`servers/invite/${inviteCode}`, {});
};

export const getCurrentProfile = async (api: ClientApi) => {
  return api.get<{ id: string }>("/profile");
};

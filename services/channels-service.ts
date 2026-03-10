import { ChannelType } from "@prisma/client";
import type { ClientApi } from "@/services/client-api";

export interface ChannelPayload {
  name: string;
  type: ChannelType;
}

export interface UpdateChannelNotifyPayload {
  serverId: string;
  isNotify: boolean;
}

export interface ChannelReadResponse {
  id: string;
  memberId: string;
  channelId: string;
  lastReadAt: string;
  formerLastReadAt: string | null;
  isNotify: boolean;
}

export const createChannel = async (
  api: ClientApi,
  serverId: string,
  values: ChannelPayload,
) => {
  return api.post(`/servers/${serverId}/channels`, values);
};

export const updateChannel = async (
  api: ClientApi,
  serverId: string,
  channelId: string,
  values: ChannelPayload,
) => {
  return api.patch(`/servers/${serverId}/channels/${channelId}`, values);
};

export const deleteChannel = async (
  api: ClientApi,
  serverId: string,
  channelId: string,
) => {
  return api.delete(`/servers/${serverId}/channels/${channelId}`);
};

export const markChannelAsRead = async (
  api: ClientApi,
  channelId: string,
  serverId: string,
) => {
  return api.post(`/channel-messages/${channelId}/read`, { serverId });
};

export const updateChannelNotify = async (
  api: ClientApi,
  channelId: string,
  payload: UpdateChannelNotifyPayload,
) => {
  return api.patch<ChannelReadResponse>(
    `/channel-messages/${channelId}/notify`,
    payload,
  );
};

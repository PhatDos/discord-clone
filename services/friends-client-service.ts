import type { ClientApi } from "@/services/client-api";
import type { FriendProfileResponse } from "@/types/api/member";

export const addFriend = async (api: ClientApi, targetProfileId: string) => {
  return api.post(`/users/${targetProfileId}/friend`, {});
};

export const getFriend = async (api: ClientApi, targetProfileId: string) => {
  return api.get<FriendProfileResponse>(`/users/${targetProfileId}/friend`);
};

export const removeFriend = async (api: ClientApi, targetProfileId: string) => {
  return api.delete(`/users/${targetProfileId}/friend`);
};

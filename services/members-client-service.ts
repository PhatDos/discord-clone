import type { ClientApi } from "@/services/client-api";
import type { MemberRole } from "@/types/api/member";
import type { ServerWithMembersWithProfiles } from "@/types/api/server";

export const kickMember = async (
  api: ClientApi,
  memberId: string,
  serverId: string,
) => {
  return api.delete<ServerWithMembersWithProfiles>(`/members/${memberId}`, {
    data: { serverId },
  });
};

export const changeMemberRole = async (
  api: ClientApi,
  memberId: string,
  serverId: string,
  role: MemberRole,
) => {
  return api.patch<ServerWithMembersWithProfiles>(`/members/${memberId}`, {
    serverId,
    role,
  });
};

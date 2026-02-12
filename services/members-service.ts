import { fetchWithAuth } from "@/lib/server-api-client";

export const deleteMember = async (memberId: string, serverId: string) => {
  const response = await fetchWithAuth((client, config) =>
    client.delete(`/members/${memberId}`, {
      ...config,
      data: { serverId },
    })
  );

  return response.data;
};

export const updateMemberRole = async (
  memberId: string,
  serverId: string,
  role: string
) => {
  const response = await fetchWithAuth((client, config) =>
    client.patch(
      `/members/${memberId}`,
      {
        serverId,
        role,
      },
      config
    )
  );

  return response.data;
};

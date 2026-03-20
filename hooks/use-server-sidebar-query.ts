import { useQuery } from "@tanstack/react-query";
import { ServerSidebarResponse } from "@/types/api/server";

interface UseServerSidebarQueryProps {
  serverId: string;
}

const fetchServerSidebarData = async (
  serverId: string
): Promise<ServerSidebarResponse> => {
  const response = await fetch(`/api/servers/${serverId}/sidebar`);
  if (!response.ok) {
    throw new Error("Failed to fetch server sidebar data");
  }
  return response.json();
};

export const useServerSidebarQuery = ({
  serverId,
}: UseServerSidebarQueryProps) => {
  return useQuery({
    queryKey: ["server-sidebar", serverId],
    queryFn: () => fetchServerSidebarData(serverId),
    staleTime: 0,
    refetchOnMount: "always",
  });
};

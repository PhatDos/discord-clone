import { fetchWithAuth } from "@/lib/server-api-client";

export const currentProfile = async () => {
  const response = await fetchWithAuth((client, config) =>
    client.get("/profile", {
      ...config,
    })
  );

  return response.data;
};

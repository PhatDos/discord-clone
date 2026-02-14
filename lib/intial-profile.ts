import { currentUser, auth } from "@clerk/nextjs/server";
import { fetchWithAuth } from "@/lib/server-api-client";

export const initialProfile = async () => {
  const user = await currentUser();
  const { redirectToSignIn } = await auth();

  if (!user) {
    return redirectToSignIn();
  }

  const response = await fetchWithAuth((client, config) =>
    client.get("/profile", config)
  );

  return response.data;
};

import { currentUser, auth } from "@clerk/nextjs/server";
import { fetchWithAuth } from "@/lib/server-api-client";

export const initialProfile = async () => {
  const user = await currentUser();
  const { redirectToSignIn } = await auth();

  if (!user) {
    return redirectToSignIn();
  }

  // Try to get existing profile
  try {
    const response = await fetchWithAuth((client, config) =>
      client.post("/profile/initial", {}, config)
    );
    return response.data;
  } catch {
    // Profile doesn't exist, proceed to create it
  }

  // Create new profile
  try {
    const response = await fetchWithAuth((client, config) =>
      client.post("/profile/register", {}, config)
    );
    return response.data;
  } catch (error) {
    console.error("Failed to create profile:", error);
    throw error;
  }
};

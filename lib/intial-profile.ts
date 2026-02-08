import { currentUser, auth } from "@clerk/nextjs/server";
import apiClient from "@/lib/api-client";

export const initialProfile = async () => {
  const user = await currentUser();
  const { getToken, redirectToSignIn } = await auth();

  if (!user) {
    return redirectToSignIn();
  }

  const token = await getToken();
  if (!token) {
    return redirectToSignIn();
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Try to get existing profile
  try {
    const response = await apiClient.post("/profile/initial", {}, { headers });
    return response.data;
  } catch (e) {
    // Profile doesn't exist, create it
  }

  // Create new profile
  try {
    const response = await apiClient.post("/profile/register", {}, { headers });
    return response.data;
  } catch (error) {
    console.error("Failed to create profile:", error);
    throw error;
  }
};

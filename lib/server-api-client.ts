import { auth } from "@clerk/nextjs/server";
import apiClient from "@/lib/api-client";
import { AxiosRequestConfig } from "axios";

/**
 * Executes an authenticated request using the shared apiClient.
 * This is designed for use in Server Components and API Routes (Next.js App Router).
 */
export const fetchWithAuth = async <T>(
  fn: (client: typeof apiClient, config: AxiosRequestConfig) => Promise<T>
): Promise<T> => {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    throw new Error("Unauthorized: No token found");
  }

  const config: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  return fn(apiClient, config);
};

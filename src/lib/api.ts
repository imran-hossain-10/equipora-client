
import { authClient } from "./auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://equipora-server-livid.vercel.app/api";

// Get JWT token from Better Auth
export const getAccessToken = async (): Promise<string> => {
  const result = await authClient.token();

  if (result.error || !result.data?.token) {
    throw new Error("Authentication token পাওয়া যায়নি। আবার Login করো।");
  }

  return result.data.token;
};

// Reusable protected API request
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = await getAccessToken();

  const headers = new Headers(options.headers);

  headers.set("Authorization", `Bearer ${token}`);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "API request failed");
  }

  return data;
};

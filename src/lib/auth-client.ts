
import { createAuthClient } from "better-auth/react";
import {
  jwtClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_SERVER_URL ||
    "https://equipora-server-livid.vercel.app",

  basePath: "/api/auth",

  fetchOptions: {
    credentials: "include",
  },

  plugins: [
    jwtClient(),

    inferAdditionalFields({
      user: {
        role: {
          type: "string",
        },
      },
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;

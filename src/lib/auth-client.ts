
import { createAuthClient } from "better-auth/react";
import {
  jwtClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
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

import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth";

import { getAuthRuntimeConfig, isAuthSignupEnabled } from "@/lib/auth-config";
import { sendAuthEmail } from "@/lib/auth-email";
import { getAuthDb } from "@/lib/db";

const config = getAuthRuntimeConfig();

export const auth = betterAuth({
  appName: "HomeVault",
  baseURL: config.baseURL,
  secret: config.secret,
  database: prismaAdapter(getAuthDb(), {
    provider: "postgresql",
  }),
  trustedOrigins: [config.baseURL],
  emailAndPassword: {
    enabled: true,
    disableSignUp: !isAuthSignupEnabled(),
    requireEmailVerification: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendAuthEmail({
        to: user.email,
        subject: "Reset your HomeVault password",
        text: `Reset your HomeVault password: ${url}`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    expiresIn: 60 * 60,
    sendVerificationEmail: async ({ user, url }) => {
      await sendAuthEmail({
        to: user.email,
        subject: "Verify your HomeVault email",
        text: `Verify your HomeVault email: ${url}`,
      });
    },
  },
  account: {
    accountLinking: {
      enabled: false,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
});

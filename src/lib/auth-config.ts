import { isAuthEmailConfigured } from "@/lib/auth-email";
import { isDatabaseConfigured } from "@/lib/db";

export function isAuthRuntimeConfigured() {
  return (
    isDatabaseConfigured() &&
    Boolean(process.env.BETTER_AUTH_SECRET) &&
    Boolean(process.env.BETTER_AUTH_URL)
  );
}

export function isAuthSignupEnabled() {
  return process.env.AUTH_SIGNUP_ENABLED === "true" && isAuthEmailConfigured();
}

export function getAuthRuntimeConfig() {
  if (!isAuthRuntimeConfigured()) {
    throw new Error("Production authentication is not configured.");
  }

  return {
    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL!,
  };
}

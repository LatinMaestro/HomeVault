export type AuthEmailMessage = {
  to: string;
  subject: string;
  text: string;
};

export function isAuthEmailConfigured() {
  return (
    Boolean(process.env.AUTH_EMAIL_FROM) &&
    Boolean(process.env.AUTH_EMAIL_PROVIDER) &&
    process.env.AUTH_EMAIL_PROVIDER !== "disabled"
  );
}

export async function sendAuthEmail(_message: AuthEmailMessage) {
  throw new Error(
    "Authentication email delivery is unavailable until a verified provider and sending domain are configured.",
  );
}

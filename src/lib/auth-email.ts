export type AuthEmailMessage = {
  to: string;
  subject: string;
  text: string;
};

export function isAuthEmailConfigured() {
  return (
    process.env.AUTH_EMAIL_PROVIDER === "resend" &&
    Boolean(process.env.AUTH_EMAIL_FROM) &&
    Boolean(process.env.RESEND_API_KEY)
  );
}

export async function sendAuthEmail(message: AuthEmailMessage) {
  if (!isAuthEmailConfigured()) {
    throw new Error(
      "Authentication email delivery is unavailable until Resend and a verified sending domain are configured.",
    );
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.AUTH_EMAIL_FROM,
      to: [message.to],
      subject: message.subject,
      text: message.text,
    }),
  });

  if (!response.ok) {
    throw new Error("Authentication email delivery failed.");
  }
}

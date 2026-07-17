import { isAuthRuntimeConfigured } from "@/lib/auth-config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function unavailableResponse() {
  return Response.json(
    {
      available: false,
      message: "Production authentication is not configured for this environment.",
    },
    {
      status: 503,
      headers: {
        "Cache-Control": "private, no-store",
      },
    },
  );
}

async function handleAuth(request: Request) {
  if (!isAuthRuntimeConfigured()) {
    return unavailableResponse();
  }

  const { auth } = await import("@/lib/auth");
  return auth.handler(request);
}

export const GET = handleAuth;
export const POST = handleAuth;

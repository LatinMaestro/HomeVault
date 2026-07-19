import { isProductionRuntimeReady } from "@/lib/production-readiness";

export const dynamic = "force-dynamic";

export async function GET() {
  const ready = await isProductionRuntimeReady();

  return Response.json(
    {
      status: ready ? "ready" : "not-ready",
      service: "HomeVault",
    },
    {
      status: ready ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}

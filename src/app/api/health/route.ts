export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(
    {
      status: "ok",
      service: "HomeVault",
      dataAccess: "not-checked",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(
    {
      status: "ok",
      service: "homevault",
      dataAccess: "not-checked",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

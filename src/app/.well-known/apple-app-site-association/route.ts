export const dynamic = "force-dynamic";

export function GET() {
  const teamId = process.env.APPLE_APP_TEAM_ID?.trim();
  if (!teamId || !/^[A-Z0-9]{10}$/.test(teamId)) {
    return new Response(null, {
      status: 404,
      headers: { "Cache-Control": "public, max-age=300" },
    });
  }

  return Response.json(
    {
      applinks: {
        apps: [],
        details: [
          {
            appID: `${teamId}.au.com.homevault.app`,
            paths: ["/*"],
          },
        ],
      },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, must-revalidate",
        "Content-Type": "application/json",
      },
    },
  );
}

import { spawn } from "node:child_process";

const port = 3210;
const baseUrl = `http://127.0.0.1:${port}`;
const routes = [
  "/api/health",
  "/manifest.webmanifest",
  "/icons/homevault.svg",
  "/sw.js",
  "/offline",
  "/privacy",
  "/support",
  "/",
  "/search?q=fridge",
  "/vault",
  "/vault/rooms",
  "/vault/rooms/new",
  "/vault/rooms/room-kitchen/edit",
  "/vault/categories",
  "/vault/categories/new",
  "/vault/categories/category-appliances/edit",
  "/vault/assets",
  "/vault/assets/new",
  "/vault/assets/asset-fridge",
  "/vault/assets/asset-fridge/edit",
  "/maintenance",
  "/maintenance/new",
  "/maintenance/task-aircon-filters",
  "/maintenance/task-aircon-filters/edit",
  "/maintenance/reminders",
  "/maintenance/reminders/new",
  "/maintenance/reminders/reminder-fridge-warranty",
  "/maintenance/reminders/reminder-fridge-warranty/edit",
  "/maintenance/providers",
  "/maintenance/providers/new",
  "/maintenance/providers/provider-brisbane-home-electrical",
  "/maintenance/providers/provider-brisbane-home-electrical/edit",
  "/warranties",
  "/warranties/new",
  "/warranties/warranty-fridge",
  "/warranties/warranty-fridge/edit",
  "/receipts",
  "/receipts/new",
  "/receipts/new/receipt",
  "/receipts/new/document",
  "/receipts/receipt-fridge",
  "/receipts/receipt-fridge/edit",
  "/settings",
];

const serverEnvironment = { ...process.env };
delete serverEnvironment.DATABASE_URL;

const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "-p", String(port)],
  {
    env: serverEnvironment,
    stdio: ["ignore", "pipe", "pipe"],
  },
);

let serverOutput = "";
server.stdout.on("data", (chunk) => {
  serverOutput += chunk.toString();
});
server.stderr.on("data", (chunk) => {
  serverOutput += chunk.toString();
});

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(`HomeVault server exited before smoke testing.\n${serverOutput}`);
    }

    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // The production server is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`HomeVault server did not become ready.\n${serverOutput}`);
}

async function stopServer() {
  if (server.exitCode !== null) return;
  server.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => server.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 5000)),
  ]);
}


function assertContract(condition, message) {
  if (!condition) throw new Error(message);
}

async function verifyDeploymentContracts() {
  const homeResponse = await fetch(baseUrl);
  const contentSecurityPolicy = homeResponse.headers.get("content-security-policy") ?? "";
  assertContract(
    contentSecurityPolicy.includes("frame-ancestors 'none'"),
    "Home route is missing the anti-framing content security policy.",
  );
  assertContract(
    contentSecurityPolicy.includes("worker-src 'self'"),
    "Home route does not allow the same-origin offline worker.",
  );
  assertContract(
    homeResponse.headers.get("x-frame-options") === "DENY",
    "Home route is missing X-Frame-Options DENY.",
  );
  assertContract(
    (homeResponse.headers.get("permissions-policy") ?? "").includes("camera=()"),
    "Home route does not disable unnecessary camera permission.",
  );

  const healthResponse = await fetch(`${baseUrl}/api/health`);
  const health = await healthResponse.json();
  assertContract(health.status === "ok", "Health response status is not ok.");
  assertContract(health.service === "HomeVault", "Health response service name is incorrect.");
  assertContract(
    (healthResponse.headers.get("cache-control") ?? "").includes("no-store"),
    "Health response must not be cached.",
  );

  const manifestResponse = await fetch(`${baseUrl}/manifest.webmanifest`);
  const manifest = await manifestResponse.json();
  assertContract(manifest.name === "HomeVault", "Manifest name is incorrect.");
  assertContract(manifest.display === "standalone", "Manifest must use standalone display.");
  assertContract(manifest.start_url === "/", "Manifest start URL is incorrect.");
  assertContract(
    Array.isArray(manifest.icons) && manifest.icons.some((icon) => icon.src === "/icons/homevault.svg"),
    "Manifest does not include the HomeVault install icon.",
  );

  const robotsResponse = await fetch(`${baseUrl}/robots.txt`);
  const robots = await robotsResponse.text();
  assertContract(robots.includes("Disallow: /"), "Preview robots rules must disallow crawling.");

  const workerResponse = await fetch(`${baseUrl}/sw.js`);
  assertContract(
    (workerResponse.headers.get("cache-control") ?? "").includes("no-store"),
    "Service worker script must use refresh-safe cache headers.",
  );
  assertContract(
    workerResponse.headers.get("service-worker-allowed") === "/",
    "Service worker must be explicitly allowed at root scope.",
  );

  console.log("Verified deployment security, health, install and offline contracts.");
}

try {
  await waitForServer();

  for (const route of routes) {
    const response = await fetch(`${baseUrl}${route}`);
    const body = await response.text();

    if (!response.ok) {
      throw new Error(`${route} returned HTTP ${response.status}.`);
    }
    if (!body.includes("HomeVault")) {
      throw new Error(`${route} did not render the HomeVault application shell.`);
    }

    console.log(`OK ${response.status} ${route}`);
  }

  await verifyDeploymentContracts();
  console.log(`Verified ${routes.length} routes without DATABASE_URL.`);
} finally {
  await stopServer();
}

import { spawn } from "node:child_process";

const port = 3210;
const baseUrl = `http://127.0.0.1:${port}`;
const routes = [
  "/api/health",
  "/archive",
  "/add",
  "/manifest.webmanifest",
  "/icons/homevault.svg",
  "/sw.js",
  "/offline",
  "/calendar",
  "/home-report",
  "/getting-started",
  "/privacy",
  "/support",
  "/",
  "/search?q=fridge",
  "/vault",
  "/vault/rooms",
  "/vault/rooms/new",
  "/vault/rooms/room-kitchen",
  "/vault/rooms/room-kitchen/edit",
  "/vault/categories",
  "/vault/categories/new",
  "/vault/categories/category-appliances",
  "/vault/categories/category-appliances/edit",
  "/vault/assets",
  "/vault/assets/new",
  "/vault/assets/asset-fridge",
  "/vault/assets/asset-fridge/edit",
  "/maintenance",
  "/maintenance/new",
  "/maintenance/new?template=air-conditioner-filters",
  "/maintenance/templates",
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
  "/receipts/document-aircon-service",
  "/settings",
];

const serverEnvironment = { ...process.env };
serverEnvironment.DATABASE_URL = "postgresql://preview-lock:preview-lock@127.0.0.1:1/homevault";
delete serverEnvironment.HOMEVAULT_PREVIEW_DATABASE_ACCESS;

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
  const transportSecurity = homeResponse.headers.get("strict-transport-security") ?? "";
  assertContract(
    transportSecurity.includes("max-age=63072000") &&
      transportSecurity.includes("includeSubDomains"),
    "Home route is missing the HTTPS transport security policy.",
  );
  assertContract(
    homeResponse.headers.get("cross-origin-resource-policy") === "same-origin",
    "Home route is missing the same-origin resource policy.",
  );
  assertContract(
    homeResponse.headers.get("x-dns-prefetch-control") === "off",
    "Home route must keep speculative DNS prefetching disabled.",
  );
  assertContract(
    homeResponse.headers.get("x-permitted-cross-domain-policies") === "none",
    "Home route must reject legacy cross-domain policy files.",
  );
  assertContract(
    (homeResponse.headers.get("permissions-policy") ?? "").includes("camera=()"),
    "Home route does not disable unnecessary camera permission.",
  );

  const authResponse = await fetch(`${baseUrl}/api/auth/get-session`);
  const authStatus = await authResponse.json();
  assertContract(
    authResponse.status === 503 && authStatus.available === false,
    "Unconfigured authentication must fail closed with a service-unavailable response.",
  );
  assertContract(
    (authResponse.headers.get("cache-control") ?? "").includes("no-store"),
    "Unavailable authentication responses must not be cached.",
  );

  const healthResponse = await fetch(`${baseUrl}/api/health`);
  const health = await healthResponse.json();
  assertContract(health.status === "ok", "Health response status is not ok.");
  assertContract(health.service === "HomeVault", "Health response service name is incorrect.");
  assertContract(
    (healthResponse.headers.get("cache-control") ?? "").includes("no-store"),
    "Health response must not be cached.",
  );

  const calendarResponse = await fetch(`${baseUrl}/api/calendar.ics`);
  const calendarBody = await calendarResponse.text();
  assertContract(
    (calendarResponse.headers.get("content-type") ?? "").startsWith("text/calendar"),
    "Calendar export must use the text/calendar content type.",
  );
  assertContract(
    (calendarResponse.headers.get("content-disposition") ?? "").includes(
      'filename="homevault-calendar.ics"',
    ),
    "Calendar export must provide a stable download filename.",
  );
  assertContract(
    (calendarResponse.headers.get("cache-control") ?? "").includes("no-store"),
    "Calendar export must not be cached.",
  );
  assertContract(
    calendarBody.includes("BEGIN:VCALENDAR") &&
      calendarBody.includes("BEGIN:VEVENT") &&
      calendarBody.includes("END:VCALENDAR"),
    "Calendar export must contain at least one valid sample event.",
  );

  const householdExportResponse = await fetch(`${baseUrl}/api/export/household.json`);
  const householdExport = await householdExportResponse.json();
  assertContract(
    (householdExportResponse.headers.get("cache-control") ?? "").includes("no-store"),
    "Household export must not be cached.",
  );
  assertContract(
    (householdExportResponse.headers.get("content-disposition") ?? "").includes(
      'filename="homevault-household.json"',
    ),
    "Household export must provide a stable download filename.",
  );
  assertContract(
    householdExport.format === "homevault-household-export" &&
      householdExport.formatVersion === 1 &&
      householdExport.household?.name,
    "Household export contract is incomplete.",
  );

  const inventoryExportResponse = await fetch(`${baseUrl}/api/export/inventory.csv`);
  const inventoryExport = await inventoryExportResponse.text();
  assertContract(
    (inventoryExportResponse.headers.get("content-type") ?? "").startsWith("text/csv"),
    "Inventory export must use the text/csv content type.",
  );
  assertContract(
    (inventoryExportResponse.headers.get("cache-control") ?? "").includes("no-store"),
    "Inventory export must not be cached.",
  );
  assertContract(
    (inventoryExportResponse.headers.get("content-disposition") ?? "").includes(
      'filename="homevault-inventory.csv"',
    ),
    "Inventory export must provide a stable download filename.",
  );
  assertContract(
    inventoryExport.startsWith('"Asset","Category","Room"') &&
      inventoryExport.split("\r\n").length > 2,
    "Inventory export must contain its header and sample assets.",
  );

  const maintenanceExportResponse = await fetch(
    `${baseUrl}/api/export/maintenance.csv`,
  );
  const maintenanceExport = await maintenanceExportResponse.text();
  assertContract(
    (maintenanceExportResponse.headers.get("content-type") ?? "").startsWith("text/csv"),
    "Maintenance history export must use the text/csv content type.",
  );
  assertContract(
    (maintenanceExportResponse.headers.get("cache-control") ?? "").includes("no-store"),
    "Maintenance history export must not be cached.",
  );
  assertContract(
    (maintenanceExportResponse.headers.get("content-disposition") ?? "").includes(
      'filename="homevault-maintenance-history.csv"',
    ),
    "Maintenance history export must provide a stable download filename.",
  );
  assertContract(
    maintenanceExport.startsWith('"Task","Asset","Completed date"') &&
      maintenanceExport.split("\r\n").length > 2,
    "Maintenance history export must contain its header and sample completion.",
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

  console.log("Verified deployment security, health, install, offline and fail-closed preview contracts.");
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
  console.log(`Verified ${routes.length} routes without live database access.`);
} finally {
  await stopServer();
}

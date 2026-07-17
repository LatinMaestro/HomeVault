import { spawn } from "node:child_process";

const port = 3210;
const baseUrl = `http://127.0.0.1:${port}`;
const routes = [
  "/api/health",
  "/manifest.webmanifest",
  "/icons/homevault.svg",
  "/sw.js",
  "/offline",
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

  console.log(`Verified ${routes.length} routes without DATABASE_URL.`);
} finally {
  await stopServer();
}

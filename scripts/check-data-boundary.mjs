import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative, sep } from "node:path";

const root = process.cwd();
const sourceRoot = join(root, "src");
const approvedDatabaseModule = "src/lib/db.ts";
const sourceExtensions = new Set([".ts", ".tsx"]);
const restrictedTokens = [
  "process.env.DATABASE_URL",
  "process.env.HOMEVAULT_PREVIEW_DATABASE_ACCESS",
  "new PrismaClient",
  "new PrismaPg",
];

function listSourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listSourceFiles(path);
    return sourceExtensions.has(extname(entry.name)) ? [path] : [];
  });
}

function repositoryPath(path) {
  return relative(root, path).split(sep).join("/");
}

const violations = [];

for (const path of listSourceFiles(sourceRoot)) {
  const file = repositoryPath(path);
  const content = readFileSync(path, "utf8");

  if (file !== approvedDatabaseModule) {
    for (const token of restrictedTokens) {
      if (content.includes(token)) {
        violations.push(`${file}: restricted database token "${token}" must stay in ${approvedDatabaseModule}`);
      }
    }
  }

  const isClientModule = /^["']use client["'];/m.test(content);
  if (
    isClientModule &&
    (content.includes("@/lib/db") || content.includes("@prisma/client"))
  ) {
    violations.push(`${file}: client modules must not import or inspect server database access`);
  }
}

const databaseModule = readFileSync(join(root, approvedDatabaseModule), "utf8");
const requiredContracts = [
  'process.env.HOMEVAULT_PREVIEW_DATABASE_ACCESS === "enabled"',
  "if (!isPreviewDatabaseEnabled())",
];

for (const contract of requiredContracts) {
  if (!databaseModule.includes(contract)) {
    violations.push(`${approvedDatabaseModule}: missing fail-closed contract "${contract}"`);
  }
}

const householdReadModulePath = "src/lib/home-data.ts";
const householdReadModule = readFileSync(join(root, householdReadModulePath), "utf8");
const householdReadContracts = [
  'getCurrentHouseholdAccess',
  'getHouseholdDb',
  'homeId: access.homeId',
];

for (const contract of householdReadContracts) {
  if (!householdReadModule.includes(contract)) {
    violations.push(`${householdReadModulePath}: missing household access contract "${contract}"`);
  }
}

for (const forbidden of ["getCurrentHomeId", "isPreviewDatabaseEnabled", "getDb()"]) {
  if (householdReadModule.includes(forbidden)) {
    violations.push(`${householdReadModulePath}: bypasses household access through "${forbidden}"`);
  }
}

const appSourceRoot = join(sourceRoot, "app");
for (const file of listSourceFiles(appSourceRoot)) {
  const source = readFileSync(file, "utf8");
  const sourcePath = relative(root, file).split(sep).join("/");
  for (const forbidden of ["isPreviewDatabaseEnabled", "getCurrentHomeId", "getDb()"]) {
    if (source.includes(forbidden)) {
      violations.push(`${sourcePath}: bypasses household access through "${forbidden}"`);
    }
  }
}

const publicShellPages = new Set([
  "src/app/privacy/page.tsx",
  "src/app/support/page.tsx",
]);
for (const page of publicShellPages) {
  const source = readFileSync(join(root, page), "utf8");
  if (!source.includes("<AppShell") || !source.includes("publicAccess")) {
    violations.push(`${page}: public policy/help page must explicitly opt out of account navigation protection`);
  }
}

const appShellModulePath = "src/components/app-shell.tsx";
const appShellModule = readFileSync(join(root, appShellModulePath), "utf8");
for (const contract of [
  "getCurrentVerifiedSessionUser",
  "getCurrentHouseholdAccess",
  'redirect("/sign-in")',
  'redirect("/onboarding")',
]) {
  if (!appShellModule.includes(contract)) {
    violations.push(`${appShellModulePath}: missing navigation access contract "${contract}"`);
  }
}

if (violations.length > 0) {
  console.error("HomeVault data boundary check failed:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log(
  `Verified ${listSourceFiles(sourceRoot).length} source files: database credentials and client construction remain server-contained and fail closed.`,
);

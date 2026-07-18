import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const schemaPath = resolve("prisma/schema.prisma");
const migrationsRoot = resolve("prisma/migrations");
const baselinePath = resolve(
  "prisma/migrations/0001_homevault_baseline/migration.sql",
);
const lockPath = resolve("prisma/migrations/migration_lock.toml");

const migrationDirectories = (await readdir(migrationsRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const [schema, baseline, lock, ...migrationSql] = await Promise.all([
  readFile(schemaPath, "utf8"),
  readFile(baselinePath, "utf8"),
  readFile(lockPath, "utf8"),
  ...migrationDirectories.map((directory) =>
    readFile(resolve(migrationsRoot, directory, "migration.sql"), "utf8"),
  ),
]);

const models = [...schema.matchAll(/^model\s+(\w+)\s+\{/gm)].map(
  ([, name]) => name,
);
const enums = [...schema.matchAll(/^enum\s+(\w+)\s+\{/gm)].map(
  ([, name]) => name,
);

const missingTables = models.filter(
  (name) => !baseline.includes(`CREATE TABLE "${name}"`),
);
const missingEnums = enums.filter(
  (name) => !baseline.includes(`CREATE TYPE "${name}" AS ENUM`),
);
const allMigrations = migrationSql.join("\n");
const destructivePatterns = [
  /\bDROP\s+(?:TABLE|SCHEMA|TYPE|DATABASE)\b/i,
  /\bTRUNCATE\b/i,
  /\bDELETE\s+FROM\b/i,
  /\bALTER\s+TABLE\b[\s\S]*?\bDROP\b/i,
];
const destructive = destructivePatterns.find((pattern) =>
  pattern.test(allMigrations),
);

if (lock.trim() !== 'provider = "postgresql"') {
  throw new Error("Migration lock must target PostgreSQL.");
}

if (migrationDirectories.length === 0 || migrationDirectories[0] !== "0001_homevault_baseline") {
  throw new Error("The HomeVault baseline must remain the first migration.");
}

if (missingTables.length > 0 || missingEnums.length > 0) {
  throw new Error(
    `Migration baseline is incomplete. Missing tables: ${missingTables.join(", ") || "none"}; missing enums: ${missingEnums.join(", ") || "none"}.`,
  );
}

if (destructive) {
  throw new Error(`Migration history contains a destructive statement: ${destructive}.`);
}

console.log(
  `Migration history has ${migrationDirectories.length} reviewed migration(s); the baseline covers ${models.length} models and ${enums.length} enums without destructive statements.`,
);

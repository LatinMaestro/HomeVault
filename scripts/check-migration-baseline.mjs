import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const schemaPath = resolve("prisma/schema.prisma");
const migrationPath = resolve(
  "prisma/migrations/0001_homevault_baseline/migration.sql",
);
const lockPath = resolve("prisma/migrations/migration_lock.toml");

const [schema, migration, lock] = await Promise.all([
  readFile(schemaPath, "utf8"),
  readFile(migrationPath, "utf8"),
  readFile(lockPath, "utf8"),
]);

const models = [...schema.matchAll(/^model\s+(\w+)\s+\{/gm)].map(
  ([, name]) => name,
);
const enums = [...schema.matchAll(/^enum\s+(\w+)\s+\{/gm)].map(
  ([, name]) => name,
);

const missingTables = models.filter(
  (name) => !migration.includes(`CREATE TABLE "${name}"`),
);
const missingEnums = enums.filter(
  (name) => !migration.includes(`CREATE TYPE "${name}" AS ENUM`),
);
const destructivePatterns = [
  /\bDROP\s+(?:TABLE|SCHEMA|TYPE|DATABASE)\b/i,
  /\bTRUNCATE\b/i,
  /\bDELETE\s+FROM\b/i,
  /\bALTER\s+TABLE\b[\s\S]*?\bDROP\b/i,
];
const destructive = destructivePatterns.find((pattern) =>
  pattern.test(migration),
);

if (lock.trim() !== 'provider = "postgresql"') {
  throw new Error("Migration lock must target PostgreSQL.");
}

if (missingTables.length > 0 || missingEnums.length > 0) {
  throw new Error(
    `Migration baseline is incomplete. Missing tables: ${missingTables.join(", ") || "none"}; missing enums: ${missingEnums.join(", ") || "none"}.`,
  );
}

if (destructive) {
  throw new Error(`Migration baseline contains a destructive statement: ${destructive}.`);
}

console.log(
  `Migration baseline covers ${models.length} models and ${enums.length} enums without destructive statements.`,
);

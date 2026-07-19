import { randomBytes } from "node:crypto";

import pg from "pg";

const { Client } = pg;

const origin = process.env.PRODUCTION_ORIGIN ?? "https://homevault.grovekind.com";
const connectionString = process.env.DATABASE_URL;
const testEmail = "delivered@resend.dev";
const testName = "HomeVault Release Check";
const testPassword = randomBytes(24).toString("base64url");

if (!connectionString) {
  throw new Error("HOMEVAULT_PRODUCTION_DATABASE_URL is not configured.");
}

const client = new Client({ connectionString });

async function removeTestIdentity() {
  await client.query(
    'DELETE FROM "Verification" WHERE "identifier" = $1 OR "identifier" LIKE $2',
    [testEmail, `%${testEmail}%`],
  );
  await client.query('DELETE FROM "User" WHERE "email" = $1', [testEmail]);
}

async function expectStatus(path, expectedStatus, redirect = "manual") {
  const response = await fetch(new URL(path, origin), {
    redirect,
    headers: { accept: "text/html,application/json" },
  });

  if (response.status !== expectedStatus) {
    throw new Error(
      `${path} returned ${response.status}; expected ${expectedStatus}.`,
    );
  }

  return response;
}

async function main() {
  await client.connect();

  try {
    await removeTestIdentity();

    await expectStatus("/api/health", 200);
    await expectStatus("/api/readiness", 200);
    await expectStatus("/sign-in", 200);
    await expectStatus("/sign-up", 200);
    await expectStatus("/forgot-password", 200);
    await expectStatus("/privacy", 200);
    await expectStatus("/support", 200);

    const protectedResponse = await expectStatus("/", 307);
    const protectedLocation = protectedResponse.headers.get("location");
    if (protectedLocation !== "/sign-in") {
      throw new Error("Unauthenticated dashboard did not redirect to sign in.");
    }

    const signupResponse = await fetch(
      new URL("/api/auth/sign-up/email", origin),
      {
        method: "POST",
        redirect: "manual",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          origin,
        },
        body: JSON.stringify({
          name: testName,
          email: testEmail,
          password: testPassword,
          callbackURL: `${origin}/onboarding`,
        }),
      },
    );

    if (!signupResponse.ok) {
      const body = (await signupResponse.text()).slice(0, 300);
      throw new Error(
        `Production signup returned ${signupResponse.status}: ${body}`,
      );
    }

    const identity = await client.query(
      `SELECT
        u."emailVerified",
        COUNT(a."id")::int AS "accountCount"
      FROM "User" u
      LEFT JOIN "Account" a ON a."userId" = u."id"
      WHERE u."email" = $1
      GROUP BY u."id", u."emailVerified"`,
      [testEmail],
    );

    if (identity.rowCount !== 1) {
      throw new Error("Production signup did not create exactly one test user.");
    }
    if (identity.rows[0].emailVerified !== false) {
      throw new Error("New production account was not held for email verification.");
    }
    if (identity.rows[0].accountCount !== 1) {
      throw new Error("Production signup did not create one credential account.");
    }

    console.log(
      "Production routes, auth signup, verification gate and database writes passed.",
    );
  } finally {
    await removeTestIdentity();
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Production validation failed.");
  process.exit(1);
});

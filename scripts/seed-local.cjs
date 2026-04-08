/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("node:path");
const { loadEnvConfig } = require("@next/env");

const projectRoot = path.resolve(__dirname, "..");

loadEnvConfig(projectRoot);

async function main() {
  const { seedLocalDevelopmentData } = require("../src/lib/db/local-seed.ts");
  const { closeDatabasePool } = require("../src/lib/db/client.ts");

  try {
    const result = await seedLocalDevelopmentData();

    console.log(
      `Seeded ${result.activityCount} activities and ${result.dailyStatCount} daily stat rows for owner "${result.ownerId}".`,
    );
  } finally {
    await closeDatabasePool();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown seed failure";

  console.error(`Local seed failed: ${message}`);
  process.exitCode = 1;
});

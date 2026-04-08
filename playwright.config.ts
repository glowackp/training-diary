import { defineConfig } from "@playwright/test";

/** Configures placeholder end-to-end coverage against the local Next.js app. */
export default defineConfig({
  testDir: "./src/tests/e2e",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
});

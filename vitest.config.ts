import path from "node:path";
import { defineConfig } from "vitest/config";

/** Provides the unit test setup for the local TypeScript codebase. */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/tests/unit/**/*.test.ts"],
  },
});

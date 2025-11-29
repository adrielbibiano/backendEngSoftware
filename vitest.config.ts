import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,js}"],
    coverage: {
      provider: "c8",
      reporter: ["text", "lcov"],
      reportsDirectory: "coverage/vitest",
    },
  },
});

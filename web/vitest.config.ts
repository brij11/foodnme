import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    // The jsdom + axe-core setup is heavyweight; under full-suite parallel load the default
    // 5s timeout can be exceeded by interaction tests. 15s keeps the suite deterministic.
    testTimeout: 15_000,
    setupFiles: ["./vitest.setup.ts"],
    exclude: ["e2e/**", "node_modules/**", ".next/**"],
    include: ["**/*.test.{ts,tsx}"],
  },
});

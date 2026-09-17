import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Vite resolves the tsconfig `paths` ("@/*") natively — no vite-tsconfig-paths.
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
  },
});

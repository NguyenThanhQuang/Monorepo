import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),

      "@obtp/shared-types": path.resolve(
        __dirname,
        "../../packages/shared-types/src/index.ts",
      ),
      "@obtp/validation": path.resolve(
        __dirname,
        "../../packages/validation/src/index.ts",
      ),
      "@obtp/business-logic": path.resolve(
        __dirname,
        "../../packages/business-logic/src/index.ts",
      ),
      "@obtp/api-client": path.resolve(
        __dirname,
        "../../packages/api-client/src/modules/index.ts",
      ),
      "@obtp/ui": path.resolve(__dirname, "../../packages/ui/src/index.ts"),
    },
  },
  optimizeDeps: {
    exclude: [
      "@obtp/shared-types",
      "@obtp/validation",
      "@obtp/business-logic",
      "@obtp/ui",
    ],
  },
});

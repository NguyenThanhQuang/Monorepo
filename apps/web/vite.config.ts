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
        "../../packages/shared-types/src",
      ),
      "@obtp/validation": path.resolve(
        __dirname,
        "../../packages/validation/src",
      ),
      "@obtp/api-client": path.resolve(
        __dirname,
        "../../packages/api-client/src",
      ),
      "@obtp/business-logic": path.resolve(
        __dirname,
        "../../packages/business-logic/src",
      ),
      "@obtp/ui": path.resolve(__dirname, "../../packages/ui/src"),
    },
  },
  optimizeDeps: {
    exclude: [
      "@obtp/shared-types",
      "@obtp/validation",
      "@obtp/api-client",
      "@obtp/business-logic",
      "@obtp/ui",
    ],
  },
});

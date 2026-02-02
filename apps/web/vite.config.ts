import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 1. Alias nội bộ của Web
      "@": path.resolve(__dirname, "./src"),

      // 2. FORCE VITE đọc code từ 'src' của packages thay vì 'dist'
      "@obtp/shared-types": path.resolve(
        __dirname,
        "../../packages/shared-types/src/index.ts",
      ),
      "@obtp/validation": path.resolve(
        __dirname,
        "../../packages/validation/src/index.ts",
      ),
      "@obtp/api-client": path.resolve(
        __dirname,
        "../../packages/api-client/src/index.ts",
      ),
    },
  },
});

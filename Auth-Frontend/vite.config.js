import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // All /api calls forwarded to Spring Boot — no CORS issues in dev
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});

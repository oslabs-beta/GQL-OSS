import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3001,
    proxy: {
      "/api/": "http://localhost:3000/",
    },
  },
  plugins: [react()],
});

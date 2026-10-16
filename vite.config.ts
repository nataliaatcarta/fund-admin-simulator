import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Art, fonts and audio live in /assets and are served from the site root (/art/..., /fonts/...).
export default defineConfig({
  plugins: [react()],
  publicDir: "assets",
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Art, fonts and audio live in /assets and are served from the site root (art/..., fonts/...).
// base "./" keeps every URL relative so the build works under any sub-path (e.g. GitHub Pages).
export default defineConfig({
  base: "./",
  plugins: [react()],
  publicDir: "assets",
});

// @lovable.dev/vite-tanstack-config already includes tanstackStart, viteReact, tailwindcss,
// tsConfigPaths, nitro, componentTagger, env injection, aliases, dedupe, error loggers.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  // Build for a standalone Node.js server (VPS / PM2), instead of Cloudflare Workers.
  nitro: {
    preset: "node-server",
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

// Pure SPA build for shared hosting / cPanel / VPS public_html.
// Output: dist/  (contains index.html + assets/ + .htaccess)
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  server: { host: "::", port: 8080 },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
  },
});

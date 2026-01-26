import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const rawBase = (env.VITE_BASE_URL || "/").trim();
  const basePath = rawBase === "" ? "/" : rawBase;
  const withLeadingSlash = basePath.startsWith("/") ? basePath : `/${basePath}`;
  const normalizedBase = withLeadingSlash.endsWith("/")
    ? withLeadingSlash
    : `${withLeadingSlash}/`;

  return {
    plugins: [react(), tailwindcss()],
    // Rutas absolutas para evitar fallos en deep links (ej: /login).
    base: normalizedBase,
    build: {
      outDir: "dist",
    },
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:3001",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});

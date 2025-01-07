import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import inject from "@rollup/plugin-inject";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      components: path.resolve(__dirname, "./src/components"),
      pages: path.resolve(__dirname, "./src/pages"),
      templates: path.resolve(__dirname, "./src/components/templates"),
      buffer: "buffer/",
    },
    extensions: [".mjs", ".js", ".jsx", ".json"],
  },
  server: {
    port: 3000,
    host: true,
  },
  preview: {
    port: 3000,
    host: true,
  },
  optimizeDeps: {
    include: ["buffer"],
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: "globalThis",
      },
      loader: {
        ".js": "jsx",
      },
    },
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
    rollupOptions:
      process.env.NODE_ENV === "production"
        ? {
            plugins: [inject({ Buffer: ["buffer", "Buffer"] })],
          }
        : undefined,
  },
  define:
    process.env.NODE_ENV === "development"
      ? {
          global: {},
        }
      : undefined,
});

import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    host: true,
    port: 4005,
  },
  build: {
    target: "esnext",
  },
});

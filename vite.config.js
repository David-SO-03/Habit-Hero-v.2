import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: false, // usamos tu manifest existente
      includeAssets: [
        "icons/web-app-manifest-192x192.png",
        "icons/web-app-manifest-512x512.png",
      ],
    }),
  ],
});

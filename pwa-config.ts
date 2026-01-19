// pwa-config.ts
import { VitePWAOptions } from "vite-plugin-pwa";

export const pwaConfig: Partial<VitePWAOptions> = {
  registerType: "autoUpdate",
  workbox: {
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
    globPatterns: ["**/*.{js,css,html,ico,png,svg,mp3}"],
  },
  includeAssets: ["logo-x-app.svg", "logo-x-app.png"],
  manifest: {
    name: "English Mastery: Daily Vocabulary",
    short_name: "English Master",
    description: "Smart English vocabulary learning app with Flashcards and interactive exercises.",
    theme_color: "#1b2328",
    background_color: "#ffffff",
    display: "standalone",
    orientation: "portrait",
    scope: "/",
    start_url: "/",
    icons: [
      {
        src: "logo-x-app.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "logo-x-app.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["education", "learning"],
  },
  devOptions: {
    enabled: true,
  },
};
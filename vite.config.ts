import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate", // Tự động cập nhật app khi có bản mới
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,mp3}"], // Thêm mp3 nếu có
      },
      includeAssets: ["logo-app.svg", "logo-app.png"],
      manifest: {
        name: "English Mastery: Daily Vocabulary",
        short_name: "English Master",
        description:
          "Smart English vocabulary learning app with Flashcards and interactive exercises.",
        theme_color: "#5058ff",
        background_color: "#ffffff", // Splash screen nên để trắng để tiệp với logo của bạn
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "logo-app.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any", // Dùng cho trình duyệt và các nơi không yêu cầu bo góc
          },
          {
            src: "logo-app.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable", // QUAN TRỌNG: Dùng cho màn hình chính điện thoại
          },
        ],
        categories: ["education", "learning"],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Định nghĩa alias @ trỏ vào thư mục src
    },
  },
  server: {
    port: 3000,
    headers: {
      "Cross-Origin-Opener-Policy": "unsafe-none",
      "Cross-Origin-Embedder-Policy": "unsafe-none",
    },
  },
});

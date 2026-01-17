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
      includeAssets: ["vite.svg"],
      manifest: {
        name: "English Mastery: Học Từ Vựng Mỗi Ngày",
        short_name: "Học Tiếng Anh",
        description:
          "Ứng dụng học từ vựng tiếng Anh thông minh với Flashcard và bài tập tương tác.",
        theme_color: "#5058ff", // Màu xanh đậm (Primary Color) giúp App trông uy tín
        background_color: "#ffffff", // Màu nền trắng cho Splash Screen
        display: "standalone",
        orientation: "portrait", // Khóa xoay màn hình dọc (phù hợp với app học tập)
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "logo.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "logo.png", // Bạn nên dùng tool để convert logo.svg sang logo.png (512x512)
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable", // Giúp icon tự bo tròn đẹp trên Android
          },
        ],
        // Thêm categories giúp Store nhận diện nội dung app (tùy chọn)
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

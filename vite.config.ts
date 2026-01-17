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
      },
      includeAssets: ["vite.svg"],
      manifest: {
        name: "My React App",
        short_name: "ReactApp",
        description: "Ứng dụng React PWA của tôi",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "vite.svg", // Đường dẫn tính từ thư mục public
            sizes: "any", // SVG có thể co giãn nên dùng "any"
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "vite.svg",
            sizes: "512x512", // Khai báo kích thước giả định để trình duyệt chấp nhận
            type: "image/svg+xml",
            purpose: "maskable", // Giúp icon hiển thị tốt trên Android
          },
        ],
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

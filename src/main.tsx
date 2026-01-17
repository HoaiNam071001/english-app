import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("Có bản cập nhật mới, bạn có muốn làm mới không?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("Ứng dụng đã sẵn sàng chạy Offline!");
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import i18n from "./i18n";

import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm(i18n.t("common:pwa.updateAvailable"))) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log(i18n.t("common:pwa.offlineReady"));
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

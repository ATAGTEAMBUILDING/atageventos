import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { registerSW } from "virtual:pwa-register";
import { App } from "./App";
import { ToastProvider } from "@/lib/toast";
import { AuthProvider } from "@/lib/auth";
import { initOfflineSync } from "@/lib/offline";
import { API_BASE } from "@/lib/api";

// Service worker (shell + API-read caching) and the offline write queue.
registerSW({ immediate: true });
initOfflineSync(API_BASE);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
);

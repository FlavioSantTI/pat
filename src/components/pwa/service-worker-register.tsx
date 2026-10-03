"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            if (process.env.NODE_ENV !== "production") {
              console.log("[Lumina PWA] Service Worker registered with scope:", reg.scope);
            }
          })
          .catch((err) => {
            console.warn("[Lumina PWA] Service Worker registration failed:", err);
          });
      });
    }
  }, []);

  return null;
}

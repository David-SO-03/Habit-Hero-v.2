import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { subscribeToPush } from "../public/subscribe.js";
import "./index.css";
import App from "./App.jsx";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Registrar Service Worker con actualización
const updateSW = registerSW({
  onOfflineReady() {
    console.log("Habit Hero listo para offline");
  },
  onNeedRefresh() {
    console.log("Nueva versión disponible");
    // Aquí puedes forzar la actualización automáticamente o preguntar al usuario
    if (confirm("Hay una nueva versión disponible. ¿Quieres actualizar?")) {
      updateSW(); // Fuerza la actualización
    }
  },
});

window.addEventListener("load", () => {
  subscribeToPush();
});

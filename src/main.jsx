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
    console.log("HABITO listo para offline");
  },
  onNeedRefresh() {
    console.log("Nueva versión disponible");
    if (confirm("Hay una nueva versión disponible. ¿Quieres actualizar?")) {
      updateSW().then(() => window.location.reload()); // recarga UNA sola vez
    }
  },
});

window.addEventListener("load", async () => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscribeToPush(); // tu función que crea la suscripción y hace POST a save-subscription
  } else {
    console.log("Ya existe suscripción push:", subscription);
  }
});

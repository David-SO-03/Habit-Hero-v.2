// Convierte la clave VAPID de base64 a Uint8Array
export function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}

export async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      "BCKKuSk-l0ufVJjAScVp3reJiUOT8SFFFu1xkifLJlk1qHk1mNMovL_nnOu-xMjIAtPlwbv_syvYSfOamvTEcWs"
    ),
  });

  try {
    const res = await fetch("/.netlify/functions/save-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    });
    if (!res.ok) throw new Error("No se pudo guardar la suscripción");
    console.log("Suscripción push guardada correctamente");
  } catch (err) {
    console.error("Error guardando suscripción:", err);
  }
}

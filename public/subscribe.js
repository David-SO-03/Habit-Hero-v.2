export async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
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

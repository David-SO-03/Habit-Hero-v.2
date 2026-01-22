export const subscribeToPush = async () => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey:
      "BCKKuSk-l0ufVJjAScVp3reJiUOT8SFFFu1xkifLJlk1qHk1mNMovL_nnOu-xMjIAtPlwbv_syvYSfOamvTEcWs",
  });

  // Guardar en Neon vía función serverless
  await fetch("/.netlify/functions/save-subscription", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription),
  });
};

import { app, analytics } from "./firebase.js";

console.log("Firebase listo para usarse", app);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js")
    .then(() => console.log("Service Worker registrado"))
    .catch(error => console.error("SW error:", error));
}

import { app } from "./firebase.js";

console.log("Firebase inicializado:", app);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js")
    .then(() => console.log("Service Worker registrado"))
    .catch(error => console.error("SW error:", error));
}

// app.js - Inicialización de Firebase y Service Worker
import { app } from "./firebase.js";

console.log("Firebase inicializado:", app);

// Registrar Service Worker con ruta relativa
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./sw.js")
      .then((reg) => console.log("Service Worker registrado", reg))
      .catch((err) =>
        console.error("Error registrando Service Worker:", err)
      );
  }
}

// Mostrar modo de instalación
function checkPWAInstallation() {
  if (window.matchMedia("(display-mode: standalone)").matches) {
    console.log("PWA en standalone");
  } else {
    console.log("PWA en navegador");
  }
}

// Ocultar pantalla de carga
function hideLoading() {
  const loading = document.getElementById("loading");
  if (loading) {
    setTimeout(() => {
      loading.style.display = "none";
    }, 800);
  }
}

// Inicialización de App
function initApp() {
  registerServiceWorker();
  checkPWAInstallation();
  hideLoading();
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

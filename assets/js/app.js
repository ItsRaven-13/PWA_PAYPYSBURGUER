// app.js - Inicialización de Firebase y Service Worker
import { app } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

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

  // Reconstruir UI según estado de Auth al cargar
  onAuthStateChanged(auth, user => {
    if (user) {
      import(`./catalogo.js?v=${Date.now()}`).then(mod => {
        if (typeof mod.loadCatalogo === "function") mod.loadCatalogo();
      }).catch(err => console.warn("Error cargando catálogo:", err));
    } else {
      import(`./login.js?v=${Date.now()}`).then(mod => {
        if (typeof mod.initializeLogin === "function") mod.initializeLogin();
      }).catch(err => console.warn("Error cargando login:", err));
    }
  });
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

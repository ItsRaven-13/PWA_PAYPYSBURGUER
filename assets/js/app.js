import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

console.log("Inicializando app...");

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js")
      .then(reg => console.log("Service Worker registrado", reg))
      .catch(err => console.error("Error registrando Service Worker:", err));
  }
}

function checkPWAInstallation() {
  if (window.matchMedia("(display-mode: standalone)").matches) {
    console.log("PWA en standalone");
  } else {
    console.log("PWA en navegador");
  }
}

function hideLoading() {
  const loading = document.getElementById("loading");
  if (loading) {
    setTimeout(() => {
      loading.style.display = "none";
    }, 800);
  }
}

function initApp() {
  registerServiceWorker();
  checkPWAInstallation();
  hideLoading();

  // Evita mostrar login por defecto: prioriza localStorage (SPA)
  const stored = (() => {
    try { 
      return JSON.parse(localStorage.getItem("userSession") || "null"); 
    } catch(e) { 
      console.warn("Error parseando userSession:", e);
      return null; 
    }
  })();

  // Si hay userSession en localStorage, carga catálogo inmediatamente (evita parpadeo)
  if (stored && stored.uid) {
    console.log("Sesión encontrada en localStorage, cargando catálogo...");
    import(`./catalogo.js?v=${Date.now()}`).then(mod => {
      if (typeof mod.loadCatalogo === "function") mod.loadCatalogo();
    }).catch(err => console.warn("No se pudo cargar catalogo desde storage:", err));
    return; // Evitar doble carga
  }

  // Siempre escuchar el estado real de Firebase y corregir UI según sea necesario
  onAuthStateChanged(auth, user => {
    console.log("onAuthStateChanged ->", user);
    if (user) {
      // Reconstruir localStorage si falta
      const sess = { uid: user.uid, email: user.email, rol: "usuario" };
      localStorage.setItem("userSession", JSON.stringify(sess));
      import(`./catalogo.js?v=${Date.now()}`).then(mod => {
        if (typeof mod.loadCatalogo === "function") mod.loadCatalogo();
      }).catch(err => console.warn("Error cargando catálogo:", err));
    } else {
      // No hay user: mostrar login
      console.log("No hay usuario autenticado, mostrando login...");
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
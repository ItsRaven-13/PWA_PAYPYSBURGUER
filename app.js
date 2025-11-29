// app.js - Importar solo lo que existe en firebase.js
import { app } from "./firebase.js";

console.log("Firebase inicializado correctamente", app);

// Registrar Service Worker
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/ItsRaven-13.github.io-PWA_PAYPYSBURGUER/sw.js')
      .then((registration) => {
        console.log('Service Worker registrado con éxito:', registration);
      })
      .catch(error => console.error('Error registrando Service Worker:', error));
  }
}

// Verificar si la PWA está instalada
function checkPWAInstallation() {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('La PWA está ejecutándose en modo standalone');
  } else {
    console.log('La PWA está ejecutándose en el navegador');
  }
}

// Ocultar loading cuando todo esté listo
function hideLoading() {
  const loading = document.getElementById('loading');
  if (loading) {
    setTimeout(() => {
      loading.style.display = 'none';
    }, 1000);
  }
}

// Inicializar la aplicación
function initApp() {
  registerServiceWorker();
  checkPWAInstallation();
  hideLoading();
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
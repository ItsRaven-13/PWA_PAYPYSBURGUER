import { app, analytics } from "./firebase.js";

console.log("Firebase listo para usarse", app);

// Registrar Service Worker
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/ItsRaven-13.github.io-PWA_PAYPYSBURGUER/sw.js')
      .then((registration) => {
        console.log('Service Worker registrado con éxito:', registration);
        
        // Verificar si hay una nueva versión del Service Worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('Nueva versión del Service Worker encontrada:', newWorker);
        });
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

// Inicializar la aplicación
function initApp() {
  registerServiceWorker();
  checkPWAInstallation();
  
  // Ocultar loading cuando todo esté listo
  const loading = document.getElementById('loading');
  if (loading) {
    setTimeout(() => {
      loading.style.display = 'none';
    }, 1000);
  }
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
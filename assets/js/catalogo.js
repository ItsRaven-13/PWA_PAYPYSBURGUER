import { auth } from "./firebase.js";
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

function getStoredSession() {
    try {
        const s1 = localStorage.getItem("userSession");
        if (s1) return JSON.parse(s1);
        const s2 = sessionStorage.getItem("userSession");
        if (s2) return JSON.parse(s2);
    } catch (e) {
        console.error("Error parseando userSession:", e);
    }
    return null;
}

export function loadCatalogo() {
    const app = document.getElementById("app");
    if (!app) {
        console.error("ERROR: No existe #app");
        return;
    }

    const session = getStoredSession();

    if (!session) {
        console.log("No hay sesión en storage, verificando Firebase Auth...");
        // Fallback: usar Firebase Auth para restaurar sesión real
        onAuthStateChanged(auth, user => {
            if (user) {
                const userSession = { uid: user.uid, email: user.email, rol: "usuario" };
                localStorage.setItem("userSession", JSON.stringify(userSession));
                loadCatalogo(); // recargar ahora que hay sesión
            } else {
                console.log("No hay usuario en Firebase, mostrando login...");
                import(`./login.js?v=${Date.now()}`).then(mod => {
                    if (typeof mod.initializeLogin === "function") mod.initializeLogin();
                    else window.location.href = "./index.html";
                }).catch(() => window.location.href = "./index.html");
            }
        });
        return;
    }

    app.innerHTML = `
    <div class="catalogo-container">
      <header class="catalogo-header">
        <img src="./assets/img/logo.png" class="logo" alt="logo">
        <div class="catalogo-usuario">
          <strong>${session.email}</strong>
          <button id="btnCerrarSesion" class="logout-btn">Cerrar sesión</button>
        </div>
      </header>

      <h1>Catálogo de productos</h1>
    <div class="productos">
      <div class="producto">
          <img src="./assets/img/alitas.png" alt="Alitas">
          <h3>Alitas</h3>
          <p>$80</p>
        </div>

      <div class="producto">
          <img src="./assets/img/a_a.png" alt="Alitas Atomicas">
          <h3>Alitas Atomicas</h3>
          <p>$80</p>
        </div>
        
      <div class="producto">
          <img src="./assets/img/a_bbq.png" alt="Alitas BBQ">
          <h3>Alitas BBQ</h3>
          <p>$80</p>
        </div>

      <div class="producto">
          <img src="./assets/img/a_bbqch.png" alt="Alitas BBQ Chipotle">
          <h3>Alitas BBQ Chipotle</h3>
          <p>$80</p>
        </div>

        <div class="producto">
          <img src="./assets/img/a_bbqh.png" alt="Alitas BBQ Hot">
          <h3>Alitas BBQ Hot</h3>
          <p>$80</p>
        </div>

        <div class="producto">
          <img src="./assets/img/a_sm.png" alt="Alitas Salsa Macha">
          <h3>Alitas Salsa Macha</h3>
          <p>$80</p>
        </div>

        <div class="producto">
          <img src="./assets/img/a_sp.png" alt="Alitas Sal y Pimienta">
          <h3>Alitas Sal y Pimienta</h3>
          <p>$80</p>
        </div>

      
        <div class="producto">
          <img src="./assets/img/hamburguesa.png" alt="Hamburguesa Clásica de Res">
          <h3>Hamburguesa Clásica de Res</h3>
          <p>$70</p>
        </div>

        <div class="producto">
          <img src="./assets/img/h_p.png" alt="Hamburguesa Clásica de Pollo">
          <h3>Hamburguesa Clásica de Pollo</h3>
          <p>$70</p>
        </div>

        <div class="producto">
          <img src="./assets/img/h_m.png" alt="Hamburguesa Monster">
          <h3>Hamburguesa Monster</h3>
          <p>$95</p>
        </div>

        <div class="producto">
          <img src="./assets/img/papas.png" alt="Papas a la francesa">
          <h3>Papas a la francesa</h3>
          <p>$50</p>
        </div>

      </div>
    </div>
  `;

    const btnCerrar = document.getElementById("btnCerrarSesion");
    if (btnCerrar) {
        btnCerrar.addEventListener("click", async () => {
            try {
                await signOut(auth);
            } catch (err) {
                console.warn("Error en signOut:", err);
            }
            localStorage.removeItem("userSession");
            sessionStorage.removeItem("userSession");

            console.log("Sesión cerrada, mostrando login...");

            try {
                const mod = await import(`./login.js?v=${Date.now()}`);
                if (typeof mod.initializeLogin === "function") {
                    mod.initializeLogin();
                    return;
                }
            } catch (err) {
                console.error("No se pudo cargar módulo login:", err);
            }
            window.location.href = "./index.html";
        });
    }
}

if (window.location.pathname.includes("catalogo.html")) {
    loadCatalogo();
}
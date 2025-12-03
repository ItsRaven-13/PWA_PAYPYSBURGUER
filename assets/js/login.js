// ...existing code...
import { auth, db } from "./firebase.js";
import {
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const appDiv = document.getElementById("app");
    if (!appDiv) {
        console.error("ERROR: No existe #app!");
        return;
    }

    appDiv.innerHTML = `
        <div class="login-container">
            <img src="assets/img/logo.png" class="logo" alt="logo">
            <h1>PAYPY'S BURGUER</h1>
            <div class="card">
                <h2>INICIO DE SESIÓN</h2>
                <form id="loginForm">
                    <input id="email" type="email" placeholder="Correo electrónico" required>
                    <input id="password" type="password" placeholder="Contraseña" required>
                    <p id="error" class="error"></p>
                    <button type="submit" id="loginBtn" class="login-btn">
                        <span id="btnText">INGRESAR</span>
                        <div id="btnSpinner" class="btn-spinner" style="display:none;"></div>
                    </button>
                </form>
                <a href="#" id="registerLink">¿No tienes cuenta? Regístrate</a>
            </div>
        </div>
    `;

    initializeLogin();
});

export function initializeLogin() {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const errorDiv = document.getElementById("error");
    const loginForm = document.getElementById("loginForm");

    if (document.getElementById("registerLink")) {
        document.getElementById("registerLink").addEventListener("click", async (e) => {
            e.preventDefault();
            try {
                const mod = await import(`./registro.js?v=${Date.now()}`);
                if (typeof mod.initializeRegistro === "function") {
                    mod.initializeRegistro();
                } else if (typeof mod.default === "function") {
                    mod.default();
                } else {
                    window.location.href = "registro.html";
                }
            } catch (err) {
                console.error("Error cargando módulo de registro:", err);
                window.location.href = "registro.html";
            }
        });
    }

    if (!loginForm) {
        console.error("ERROR: No existe #loginForm");
        return;
    }

    loginForm.onsubmit = async (e) => {
        e.preventDefault();

        const loginBtn = document.getElementById("loginBtn");
        const btnText = document.getElementById("btnText");
        const btnSpinner = document.getElementById("btnSpinner");
        if (loginBtn) loginBtn.disabled = true;
        if (btnText) btnText.style.display = "none";
        if (btnSpinner) btnSpinner.style.display = "block";
        if (errorDiv) errorDiv.textContent = "";

        const email = emailInput?.value.trim() || "";
        const password = passwordInput?.value.trim() || "";

        try {
            if (!email || !password) {
                if (errorDiv) errorDiv.textContent = "Completa todos los campos.";
                return;
            }

            // Persistencia local en el navegador (mantiene sesión después de cerrar)
            await setPersistence(auth, browserLocalPersistence);

            const cred = await signInWithEmailAndPassword(auth, email, password);
            const uid = cred.user.uid;

            let role = "usuario";
            try {
                const profile = await getDoc(doc(db, "users", uid));
                if (profile.exists()) role = profile.data().rol || role;
            } catch (errProfile) {
                console.warn("No se pudo obtener perfil de usuario:", errProfile);
            }

            const userSession = { uid, email: cred.user.email, rol: role };

            // Guardar persistente y por sesión (redundancia)
            localStorage.setItem("userSession", JSON.stringify(userSession));
            sessionStorage.setItem("userSession", JSON.stringify(userSession));

            // Cargar catálogo como SPA
            try {
                const mod = await import(`./catalogo.js?v=${Date.now()}`);
                if (typeof mod.loadCatalogo === "function") {
                    mod.loadCatalogo();
                    return;
                }
            } catch (err) {
                console.error("Error cargando catálogo:", err);
            }

            // Fallback
            window.location.href = "catalogo.html";

        } catch (err) {
            console.error(err);
            if (errorDiv) {
                let mensaje = "Credenciales incorrectas.";
                if (err.code === "auth/user-not-found") mensaje = "Usuario no encontrado.";
                else if (err.code === "auth/wrong-password") mensaje = "Contraseña incorrecta.";
                else if (err.code === "auth/invalid-email") mensaje = "Correo inválido.";
                errorDiv.textContent = mensaje;
            } else {
                alert("Error: " + (err.message || "No se pudo iniciar sesión."));
            }
        } finally {
            if (loginBtn) loginBtn.disabled = false;
            if (btnText) btnText.style.display = "inline";
            if (btnSpinner) btnSpinner.style.display = "none";
        }
    };
}
// ...existing code...
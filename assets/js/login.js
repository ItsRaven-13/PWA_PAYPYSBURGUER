// login.js - Login principal
import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Esperar hasta que #app exista
document.addEventListener("DOMContentLoaded", () => {
    const appDiv = document.getElementById("app");
    if (!appDiv) {
        console.error("ERROR: No existe #app!");
        return;
    }

    // Insertar formulario
    appDiv.innerHTML = `
        <div class="login-container">
            <img src="assets/img/logo.png" class="logo">

            <h1>PAYPY'S BURGUER</h1>

            <div class="card">
                <h2>INICIO DE SESIÓN</h2>

                <form id="loginForm">
                    <input id="email" type="email" placeholder="Correo electrónico" required>
                    <input id="password" type="password" placeholder="Contraseña" required>

                    <p id="error" class="error"></p>

                    <button type="submit" id="loginBtn">
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

function initializeLogin() {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const errorDiv = document.getElementById("error");
    const loginForm = document.getElementById("loginForm");
    document.getElementById("registerLink").addEventListener("click", async (e) => {
        e.preventDefault();
        try {
            const mod = await import("./registro.js");
            if (typeof mod.initializeRegistro === "function") {
                mod.initializeRegistro();
            } else if (typeof mod.default === "function") {
                mod.default();
            } else {
                // Fallback: si no hay función exportada, abrir página (opcional)
                window.location.href = "registro.html";
            }
        } catch (err) {
            console.error("Error cargando módulo de registro:", err);
            window.location.href = "registro.html";
        }
    });

    loginForm.onsubmit = async (e) => {
        e.preventDefault();

        const loginBtn = document.getElementById("loginBtn");
        const btnText = document.getElementById("btnText");
        const btnSpinner = document.getElementById("btnSpinner");

        // Mostrar spinner
        loginBtn.disabled = true;
        btnText.style.display = "none";
        btnSpinner.style.display = "block";

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        try {
            if (!email || !password) {
                throw new Error("Completa todos los campos");
            }

            const cred = await signInWithEmailAndPassword(auth, email, password);
            const uid = cred.user.uid;

            const profile = await getDoc(doc(db, "users", uid));

            sessionStorage.setItem("userSession", JSON.stringify({
                uid,
                email,
                rol: profile.exists() ? profile.data().rol : "usuario"
            }));

            try {
                const mod = await import(`./catalogo.js?v=${Date.now()}`);
                if (typeof mod.loadCatalogo === "function") {
                    mod.loadCatalogo();
                } else {
                    window.location.href = "catalogo.html";
                }
            } catch (err) {
                console.error("Error cargando catálogo:", err);
                window.location.href = "catalogo.html";
            }

        } catch (err) {
            console.error(err);

            // Mensajes de error más específicos
            let mensaje = "Credenciales incorrectas.";
            if (err.code === "auth/user-not-found") {
                mensaje = "Usuario no encontrado.";
            } else if (err.code === "auth/wrong-password") {
                mensaje = "Contraseña incorrecta.";
            }

            errorDiv.textContent = mensaje;

        } finally {
            // Ocultar spinner
            loginBtn.disabled = false;
            btnText.style.display = "inline";
            btnSpinner.style.display = "none";
        }
    };
}

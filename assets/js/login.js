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

    loginForm.onsubmit = async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            const uid = cred.user.uid;

            const profile = await getDoc(doc(db, "users", uid));

            sessionStorage.setItem("userSession", JSON.stringify({
                uid,
                email,
                rol: profile.exists() ? profile.data().rol : "usuario"
            }));

            window.location.href = "catalogo.html";

        } catch (err) {
            console.error(err);
            errorDiv.textContent = "Credenciales incorrectas.";
        }
    };
}

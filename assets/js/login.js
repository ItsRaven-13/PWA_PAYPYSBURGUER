// Importamos solo las variables necesarias del archivo 'firebase.js'
import { auth, db, firebaseConfig } from "./firebase.js";

// Importaciones de Firebase Auth y Firestore
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const appDiv = document.getElementById("app");

// Función para construir la ruta segura de Firestore
const getUserProfileRef = (uid) => {
    const appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";
    return doc(db, "artifacts", appId, "users", uid, "app_data", "profile");
};

// Cargar contenido del login dentro de SPA
setTimeout(() => {
    appDiv.innerHTML = `
    <div class="login-container">
        <img src="assets/img/logo.png" alt="Paypy's Burguer Logo" class="logo">
        <h1>PAYPY'S BURGUER</h1>

        <div class="card">
            <h2>INICIO DE SESIÓN</h2>

            <form id="loginForm">
                <input id="email" type="email" placeholder="Correo electrónico" class="input-field" required>
                <input id="password" type="password" placeholder="Contraseña" class="input-field" required>

                <p id="error" class="error"></p>

                <button type="submit" id="loginBtn" class="login-btn">
                    <span id="btnText">INGRESAR</span>
                    <div id="btnSpinner" class="btn-spinner" style="display: none;"></div>
                </button>
            </form>

            <a href="#" id="registerLink" class="register-link">¿No tienes cuenta? Regístrate</a>
        </div>
    </div>
    `;

    initializeLogin();
}, 500);

function initializeLogin() {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const errorDiv = document.getElementById("error");
    const loginForm = document.getElementById("loginForm");
    const loginBtn = document.getElementById("loginBtn");
    const btnText = document.getElementById("btnText");
    const btnSpinner = document.getElementById("btnSpinner");
    const registerLink = document.getElementById("registerLink");

    let isLoading = false;

    const setLoading = (loading) => {
        isLoading = loading;
        if (loading) {
            btnText.style.display = "none";
            btnSpinner.style.display = "block";
            loginBtn.disabled = true;
        } else {
            btnText.style.display = "block";
            btnSpinner.style.display = "none";
            loginBtn.disabled = false;
        }
    };

    loginForm.onsubmit = async (e) => {
        e.preventDefault();

        if (isLoading) return;

        errorDiv.textContent = "";
        setLoading(true);

        try {
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!email || !password) throw new Error("auth/empty-fields");

            // 1. Iniciar sesión
            const cred = await signInWithEmailAndPassword(auth, email, password);
            const uid = cred.user.uid;

            // 2. Obtener perfil
            const userProfileRef = getUserProfileRef(uid);
            const snap = await getDoc(userProfileRef);

            let rol = "usuario";
            let userName = "Usuario";

            if (snap.exists()) {
                const userData = snap.data();
                rol = userData.rol || "usuario";
                userName = userData.nombre || userData.email || "Usuario";
            }

            // 3. Guardar sesión
            sessionStorage.setItem("userSession", JSON.stringify({
                uid,
                email,
                rol,
                userName,
                loginTime: new Date().toISOString()
            }));

            setLoading(false);
            showSuccessMessage(`¡Bienvenido ${userName}!`);

            setTimeout(() => {
                if (rol === "admin") {
                    window.location.href = "admin.html";
                } else {
                    window.location.href = "catalogo.html";
                }
            }, 1500);

        } catch (error) {
            setLoading(false);
            const errorCode = error.code || error.message;
            errorDiv.textContent = traducirError(errorCode);
            console.error("Error en login:", error);
        }
    };

    registerLink.onclick = (e) => {
        e.preventDefault();
        window.location.href = "registro.html";
    };

    emailInput.focus();
}

function showSuccessMessage(message) {
    const successDiv = document.createElement("div");
    successDiv.className = "success-message";
    successDiv.textContent = message;
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #4CAF50;
        color: white;
        padding: 15px 30px;
        border-radius: 10px;
        text-align: center;
        font-weight: bold;
        z-index: 1000;
        animation: fadeinout 3s forwards;
    `;

    document.body.appendChild(successDiv);

    if (!document.querySelector("style#fadeAnimation")) {
        const style = document.createElement("style");
        style.id = "fadeAnimation";
        style.textContent = `
        @keyframes fadeinout {
            0%, 100% { opacity: 0; }
            10%, 90% { opacity: 1; }
        }
        `;
        document.head.appendChild(style);
    }

    setTimeout(() => successDiv.remove(), 3000);
}

function traducirError(code) {
    switch (code) {
        case "auth/user-not-found":
            return "No existe una cuenta con ese correo.";
        case "auth/wrong-password":
        case "auth/invalid-credential":
            return "El correo o la contraseña son incorrectos.";
        case "auth/invalid-email":
            return "El correo no es válido.";
        case "auth/user-disabled":
            return "La cuenta ha sido deshabilitada.";
        case "auth/too-many-requests":
            return "Demasiados intentos fallidos. Intenta más tarde.";
        case "auth/network-request-failed":
            return "Error de red. Revisa tu conexión.";
        case "auth/missing-password":
            return "La contraseña es obligatoria.";
        case "auth/missing-email":
            return "El correo es obligatorio.";
        case "auth/empty-fields":
            return "Por favor, completa todos los campos.";
        default:
            return "Error al iniciar sesión. Intenta nuevamente.";
    }
}

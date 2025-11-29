// Importamos solo las variables necesarias del archivo 'firebase.js'
import { auth, db, appId } from "./firebase.js"; 

// Importaciones de Firebase Auth y Firestore
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const appDiv = document.getElementById("app");

// Función para construir la ruta segura de Firestore
const getUserProfileRef = (uid) => {
    const app_id_value = typeof appId !== 'undefined' ? appId : 'default-app-id';
    return doc(db, 'artifacts', app_id_value, 'users', uid, 'app_data', 'profile');
};

// Mostrar loading mientras se carga
appDiv.innerHTML = `
<div class="loading">
    <div class="spinner"></div>
    <p>Cargando...</p>
</div>
`;

// Cargar el contenido después de que el DOM esté listo
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
    // Obtener elementos del DOM
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const errorDiv = document.getElementById("error");
    const loginForm = document.getElementById("loginForm");
    const loginBtn = document.getElementById("loginBtn");
    const btnText = document.getElementById("btnText");
    const btnSpinner = document.getElementById("btnSpinner");
    const registerLink = document.getElementById("registerLink");

    // Estado del formulario
    let isLoading = false;

    // Función para mostrar/ocultar loading en el botón
    const setLoading = (loading) => {
        isLoading = loading;
        if (loading) {
            btnText.style.display = 'none';
            btnSpinner.style.display = 'block';
            loginBtn.disabled = true;
        } else {
            btnText.style.display = 'block';
            btnSpinner.style.display = 'none';
            loginBtn.disabled = false;
        }
    };

    // Manejar envío del formulario
    loginForm.onsubmit = async (e) => {
        e.preventDefault();
        
        if (isLoading) return;
        
        errorDiv.textContent = "";
        setLoading(true);

        try {
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            // Validaciones básicas
            if (!email || !password) {
                throw new Error("auth/empty-fields");
            }

            // 1. Iniciar sesión con Firebase Auth
            const cred = await signInWithEmailAndPassword(auth, email, password);
            const uid = cred.user.uid;

            // 2. Obtener el perfil del usuario desde Firestore
            const userProfileRef = getUserProfileRef(uid);
            const snap = await getDoc(userProfileRef);

            let rol = "usuario";
            let userName = "Usuario";

            if (snap.exists()) {
                const userData = snap.data();
                rol = userData.rol || "usuario";
                userName = userData.nombre || userData.email || "Usuario";
            }

            // 3. Guardar información mínima en sessionStorage para la sesión actual
            sessionStorage.setItem('userSession', JSON.stringify({
                uid: uid,
                email: email,
                rol: rol,
                userName: userName,
                loginTime: new Date().toISOString()
            }));

            // 4. Redirección basada en el rol
            setLoading(false);
            showSuccessMessage(`¡Bienvenido ${userName}!`);
            
            // Redirección después de 1.5 segundos
            setTimeout(() => {
                if (rol === "admin") {
                    window.location.href = "admin.html";
                } else {
                    window.location.href = "catalogo.html";
                }
            }, 1500);

        } catch (error) {
            setLoading(false);
            errorDiv.textContent = traducirError(error.code);
            console.error("Error en login:", error);
        }
    };

    // Manejar click en registro
    registerLink.onclick = (e) => {
        e.preventDefault();
        // Redirigir a página de registro
        window.location.href = "registro.html";
    };

    // Auto-focus en el email al cargar
    emailInput.focus();
}

// Función para mostrar mensaje de éxito
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.cssText = `
        background: #4CAF50;
        color: white;
        padding: 15px;
        border-radius: 10px;
        margin: 10px 0;
        text-align: center;
        font-weight: bold;
    `;
    
    const errorDiv = document.getElementById("error");
    errorDiv.parentNode.insertBefore(successDiv, errorDiv.nextSibling);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Función para traducir errores de Firebase
function traducirError(code) {
    switch (code) {
        case "auth/user-not-found":
            return "No existe una cuenta con ese correo.";
        case "auth/wrong-password":
            return "La contraseña es incorrecta.";
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
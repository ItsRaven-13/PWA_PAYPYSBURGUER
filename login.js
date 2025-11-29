// Importamos solo las variables necesarias del archivo 'firebase.js'
import { auth, db, firebaseConfig  } from "./firebase.js"; 

// Importaciones de Firebase Auth y Firestore
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const appDiv = document.getElementById("app");

// Función para construir la ruta segura de Firestore (usando variables de entorno)
const getUserProfileRef = (uid) => {
    // Aseguramos que la variable global __app_id se use si está definida, sino usamos un default.
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    // Estructura de Firestore: artifacts/{appId}/users/{uid}/app_data/profile
    return doc(db, 'artifacts', appId, 'users', uid, 'app_data', 'profile');
};

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
    const loginForm = document.getElementById("loginForm"); // loginForm definido aquí
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
                // Usamos throw new Error con un código conocido para traducir el error.
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
                    // Nota: La redirección debe usar la ruta correcta para tu despliegue (e.g. con el prefijo del repositorio)
                    window.location.href = "admin.html";
                } else {
                    window.location.href = "catalogo.html";
                }
            }, 1500);

        } catch (error) {
            setLoading(false);
            // Si es un error de Firebase Auth, usa el código, sino, intenta usar el mensaje
            const errorCode = error.code ? error.code : error.message; 
            errorDiv.textContent = traducirError(errorCode);
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

// Función para mostrar mensaje de éxito (mejorada para usar el modal en lugar de alert)
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
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
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        animation: fadeinout 3s forwards;
    `;
    
    document.body.appendChild(successDiv);

    // Añadir CSS para la animación (debería ir en style.css, pero se incluye aquí para la funcionalidad)
    if (!document.querySelector('style#fadeAnimation')) {
        const style = document.createElement('style');
        style.id = 'fadeAnimation';
        style.textContent = `
            @keyframes fadeinout {
                0%, 100% { opacity: 0; }
                10%, 90% { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
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
            // Manejo de errores no reconocidos o errores personalizados
            console.warn("Código de error no traducido:", code);
            return "Error al iniciar sesión. Intenta nuevamente.";
    }
}
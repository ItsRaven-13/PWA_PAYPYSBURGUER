// Importamos las variables necesarias del archivo 'firebase.js'
import { auth, db, firebaseConfig  } from "./firebase.js"; 

// Importaciones de Firebase Auth y Firestore
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const appDiv = document.getElementById("app");

// Función para construir la ruta segura de Firestore
const getUserProfileRef = (uid) => {
    const app_id_value = typeof appId !== 'undefined' ? appId : 'default-app-id';
    return doc(db, 'artifacts', app_id_value, 'users', uid, 'app_data', 'profile');
};

// // Mostrar loading mientras se carga
// appDiv.innerHTML = `
// <div class="loading">
//     <div class="spinner"></div>
//     <p>Cargando...</p>
// </div>
// `;

// Cargar el contenido después de que el DOM esté listo
setTimeout(() => {
    appDiv.innerHTML = `
    <div class="login-container">
        <img src="assets/img/logo.png" alt="Paypy's Burguer Logo" class="logo">
        <h1>PAYPY'S BURGUER</h1>

        <div class="card">
            <h2>CREAR CUENTA</h2>

            <form id="registerForm">
                <input id="nombre" type="text" placeholder="Nombre completo" class="input-field" required>
                <input id="email" type="email" placeholder="Correo electrónico" class="input-field" required>
                <input id="telefono" type="tel" placeholder="Teléfono" class="input-field">
                <input id="password" type="password" placeholder="Contraseña" class="input-field" required minlength="6">
                <input id="confirmPassword" type="password" placeholder="Confirmar contraseña" class="input-field" required>

                <div class="password-strength">
                    <div class="strength-bar">
                        <div class="strength-fill" id="strengthFill"></div>
                    </div>
                    <span class="strength-text" id="strengthText">Seguridad de la contraseña</span>
                </div>

                <p id="error" class="error"></p>
                <p id="success" class="success"></p>

                <button type="submit" id="registerBtn" class="login-btn">
                    <span id="btnText">REGISTRARSE</span>
                    <div id="btnSpinner" class="btn-spinner" style="display: none;"></div>
                </button>
            </form>

            <a href="index.html" id="loginLink" class="register-link">¿Ya tienes cuenta? Inicia sesión</a>
        </div>
    </div>
    `;

    initializeRegister();
}, 500);

function initializeRegister() {
    // Obtener elementos del DOM
    const nombreInput = document.getElementById("nombre");
    const emailInput = document.getElementById("email");
    const telefonoInput = document.getElementById("telefono");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const errorDiv = document.getElementById("error");
    const successDiv = document.getElementById("success");
    const registerForm = document.getElementById("registerForm");
    const registerBtn = document.getElementById("registerBtn");
    const btnText = document.getElementById("btnText");
    const btnSpinner = document.getElementById("btnSpinner");
    const strengthFill = document.getElementById("strengthFill");
    const strengthText = document.getElementById("strengthText");

    // Estado del formulario
    let isLoading = false;

    // Función para mostrar/ocultar loading en el botón
    const setLoading = (loading) => {
        isLoading = loading;
        if (loading) {
            btnText.style.display = 'none';
            btnSpinner.style.display = 'block';
            registerBtn.disabled = true;
        } else {
            btnText.style.display = 'block';
            btnSpinner.style.display = 'none';
            registerBtn.disabled = false;
        }
    };

    // Validar fortaleza de contraseña en tiempo real
    passwordInput.addEventListener('input', updatePasswordStrength);
    
    function updatePasswordStrength() {
        const password = passwordInput.value;
        let strength = 0;
        let text = '';
        let color = '#ff4757';

        // Validaciones de fortaleza
        if (password.length >= 6) strength += 25;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 25;
        if (password.match(/\d/)) strength += 25;
        if (password.match(/[^a-zA-Z\d]/)) strength += 25;

        // Determinar texto y color
        if (password.length === 0) {
            text = 'Seguridad de la contraseña';
            color = '#f1f2f6';
        } else if (strength < 50) {
            text = 'Débil';
            color = '#ff4757';
        } else if (strength < 75) {
            text = 'Moderada';
            color = '#ffa502';
        } else {
            text = 'Fuerte';
            color = '#2ed573';
        }

        // Actualizar UI
        strengthFill.style.width = `${strength}%`;
        strengthFill.style.backgroundColor = color;
        strengthText.textContent = text;
        strengthText.style.color = color;
    }

    // Validar que las contraseñas coincidan en tiempo real
    confirmPasswordInput.addEventListener('input', validatePasswordMatch);

    function validatePasswordMatch() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (confirmPassword && password !== confirmPassword) {
            confirmPasswordInput.style.borderColor = '#ff4757';
            return false;
        } else if (confirmPassword) {
            confirmPasswordInput.style.borderColor = '#2ed573';
            return true;
        } else {
            confirmPasswordInput.style.borderColor = '#ddd';
            return true;
        }
    }

    // Manejar envío del formulario
    registerForm.onsubmit = async (e) => {
        e.preventDefault();
        
        if (isLoading) return;
        
        errorDiv.textContent = "";
        successDiv.textContent = "";

        try {
            const nombre = nombreInput.value.trim();
            const email = emailInput.value.trim();
            const telefono = telefonoInput.value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            // Validaciones del formulario
            if (!nombre || !email || !password || !confirmPassword) {
                throw new Error("auth/empty-fields");
            }

            if (password.length < 6) {
                throw new Error("auth/weak-password");
            }

            if (password !== confirmPassword) {
                throw new Error("auth/passwords-dont-match");
            }

            if (!validateEmail(email)) {
                throw new Error("auth/invalid-email");
            }

            setLoading(true);

            // 1. Crear usuario en Firebase Auth
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            const uid = cred.user.uid;

            // 2. Crear perfil del usuario en Firestore
            const userProfileRef = getUserProfileRef(uid);
            await setDoc(userProfileRef, {
                nombre: nombre,
                email: email,
                telefono: telefono || '',
                rol: "usuario",
                fechaRegistro: new Date().toISOString(),
                activo: true
            });

            // 3. Guardar información en sessionStorage
            sessionStorage.setItem('userSession', JSON.stringify({
                uid: uid,
                email: email,
                nombre: nombre,
                rol: "usuario",
                loginTime: new Date().toISOString()
            }));

            // 4. Mostrar éxito y redirigir
            setLoading(false);
            showSuccessMessage("¡Cuenta creada exitosamente! Redirigiendo...");
            
            // Redirección después de 2 segundos
            setTimeout(() => {
                window.location.href = "catalogo.html";
            }, 2000);

        } catch (error) {
            setLoading(false);
            errorDiv.textContent = traducirError(error.code);
            console.error("Error en registro:", error);
        }
    };

    // Auto-focus en el nombre al cargar
    nombreInput.focus();
}

// Función para validar email
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Función para mostrar mensaje de éxito
function showSuccessMessage(message) {
    const successDiv = document.getElementById("success");
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    
    // Scroll to success message
    successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Función para traducir errores de Firebase
function traducirError(code) {
    switch (code) {
        case "auth/email-already-in-use":
            return "Este correo electrónico ya está registrado.";
        case "auth/invalid-email":
            return "El correo electrónico no es válido.";
        case "auth/weak-password":
            return "La contraseña debe tener al menos 6 caracteres.";
        case "auth/operation-not-allowed":
            return "El registro con email/contraseña no está habilitado.";
        case "auth/empty-fields":
            return "Por favor, completa todos los campos obligatorios.";
        case "auth/passwords-dont-match":
            return "Las contraseñas no coinciden.";
        case "auth/network-request-failed":
            return "Error de red. Revisa tu conexión.";
        default:
            return "Error al crear la cuenta. Intenta nuevamente.";
    }
}
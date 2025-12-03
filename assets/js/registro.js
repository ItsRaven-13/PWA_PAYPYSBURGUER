// ...existing code...
import { auth } from "./firebase.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { db } from "./firebase.js";
import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

export function initializeRegistro() {
    const appDiv = document.getElementById("app");
    if (!appDiv) return;
    appDiv.innerHTML = `
        <div class="register-container">
            <h2>REGISTRO</h2>
            <form id="registerForm">
                <input id="nombre" placeholder="Nombre" required>
                <input id="email" type="email" placeholder="Correo" required>
                <input id="password" type="password" placeholder="Contraseña" required>

                <!-- Mensaje de error -->
                <p id="registroError" class="error"></p>

                <button type="submit">REGISTRAR</button>
            </form>
        </div>
    `;

    const registerForm = document.getElementById("registerForm");
    if (!registerForm) {
        console.error("ERROR: No existe #registerForm");
        return;
    }

    registerForm.onsubmit = async (e) => {
        e.preventDefault();

        console.debug("submit registro: comprobando elementos del formulario");
        const email = document.getElementById("email")?.value.trim() || "";
        const pass = document.getElementById("password")?.value.trim() || "";
        const nombre = document.getElementById("nombre")?.value.trim() || "";

        // Obtener/crear elemento de error en el momento del submit
        let error = document.getElementById("registroError");
        if (!error) {
            console.warn("registroError no encontrado — se creará dinámicamente");
            error = document.createElement("p");
            error.id = "registroError";
            error.className = "error";
            // insertarlo justo antes del botón submit si existe el form
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            if (submitBtn && submitBtn.parentNode) submitBtn.parentNode.insertBefore(error, submitBtn);
            else registerForm.appendChild(error);
        }

        error.textContent = ""; // ahora seguro

        // Validaciones básicas
        if (!nombre || !email || !pass) {
            error.textContent = "Completa todos los campos.";
            return;
        }

        try {
            const userCred = await createUserWithEmailAndPassword(auth, email, pass);

            // Guardar datos del usuario
            await setDoc(doc(db, "users", userCred.user.uid), {
                nombre,
                email,
                rol: "usuario",
                createdAt: new Date()
            });

            alert("Cuenta creada, ahora inicia sesión.");
            // Si usas SPA queda mejor recargar/volver al estado inicial:
            window.location.href = "./index.html";

        } catch (err) {
            console.error(err);
            if (error) {
                // Mensajes más específicos si vienen del auth
                let mensaje = "No se pudo crear la cuenta.";
                if (err.code === "auth/email-already-in-use") mensaje = "El correo ya está en uso.";
                else if (err.code === "auth/invalid-email") mensaje = "Correo inválido.";
                else if (err.code === "auth/weak-password") mensaje = "La contraseña es muy débil.";
                error.textContent = mensaje;
            } else {
                // Fallback visible si el elemento de error no existe
                alert("No se pudo crear la cuenta. " + (err.message || ""));
            }
        }
    };
}

if (window.location.pathname.includes("registro.html")) {
    initializeRegistro();
}
// ...existing code...
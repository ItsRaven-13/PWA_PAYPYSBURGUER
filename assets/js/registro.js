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
                <button type="submit">REGISTRAR</button>
            </form>
        </div>
    `;

    document.getElementById("registerForm").onsubmit = async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const pass = document.getElementById("password").value.trim();
        const nombre = document.getElementById("nombre").value.trim();
        const error = document.getElementById("registroError");

        error.textContent = "";

        try {
            // En el try:
            const userCred = await createUserWithEmailAndPassword(auth, email, pass);

            // Guardar datos del usuario
            await setDoc(doc(db, "users", userCred.user.uid), {
                nombre,
                email,
                rol: "usuario",
                createdAt: new Date()
            });

            alert("Cuenta creada, ahora inicia sesión.");
            window.location.href = "./index.html";

        } catch (err) {
            console.error(err);
            error.textContent = "No se pudo crear la cuenta.";
        }
    };
}

if (window.location.pathname.includes("registro.html")) {
    loadRegistro();
}

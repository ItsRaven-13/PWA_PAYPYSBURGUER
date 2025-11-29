import { auth } from "./firebase.js";
import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

export function loadRegistro() {
    const app = document.getElementById("app");

    app.innerHTML = `
        <div class="registro-container">
            <h1>Crear cuenta</h1>

            <form id="registroForm">
                <input type="text" id="nombre" placeholder="Nombre" class="input-field" required>
                <input type="email" id="emailReg" placeholder="Correo" class="input-field" required>
                <input type="password" id="passReg" placeholder="Contraseña" class="input-field" required>

                <p id="registroError" class="error"></p>

                <button class="login-btn" type="submit">Registrarme</button>
            </form>

            <a href="./index.html" class="register-link">Ya tengo cuenta</a>
        </div>
    `;

    document.getElementById("registroForm").onsubmit = async (e) => {
        e.preventDefault();

        const email = document.getElementById("emailReg").value.trim();
        const pass = document.getElementById("passReg").value.trim();
        const nombre = document.getElementById("nombre").value.trim();
        const error = document.getElementById("registroError");

        error.textContent = "";

        try {
            await createUserWithEmailAndPassword(auth, email, pass);

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

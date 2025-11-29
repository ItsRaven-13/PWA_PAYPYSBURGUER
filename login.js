import { auth, db } from "./firebase.js";
import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const appDiv = document.getElementById("app");

appDiv.innerHTML = `
<div class="login-container">
    <img src="images/logo.png" class="logo">

    <h1>PAYPY'S BURGUER</h1>

    <div class="card">
        <h2>INICIO DE SESIÓN</h2>

        <input id="email" type="email" placeholder="Correo electrónico">
        <input id="password" type="password" placeholder="Contraseña">

        <p id="error" class="error"></p>

        <button id="loginBtn">INGRESAR</button>

        <a id="registerLink">¿No tienes cuenta? Regístrate</a>
    </div>
</div>
`;

const email = document.getElementById("email");
const password = document.getElementById("password");
const errorDiv = document.getElementById("error");
const loginBtn = document.getElementById("loginBtn");

loginBtn.onclick = async () => {
    errorDiv.textContent = "";

    try {
        const cred = await signInWithEmailAndPassword(
            auth,
            email.value.trim(),
            password.value.trim()
        );

        const uid = cred.user.uid;

        const docRef = doc(db, "usuarios", uid);
        const snap = await getDoc(docRef);

        let rol = "usuario";

        if (snap.exists()) {
            rol = snap.data().rol || "usuario";
        }

        // Guardar sesión para usar en catálogo
        localStorage.setItem("uid", uid);
        localStorage.setItem("rol", rol);

        window.location.href = "catalogo.html";

    } catch (e) {
        errorDiv.textContent = traducirError(e.code);
    }
};


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
        case "auth/email-already-in-use":
            return "El correo ya está registrado.";
        case "auth/weak-password":
            return "La contraseña es muy débil.";
        case "auth/network-request-failed":
            return "Error de red. Revisa tu conexión.";
        case "auth/missing-password":
            return "La contraseña es obligatoria.";
        case "auth/missing-email":
            return "El correo es obligatorio.";
        default:
            return "Error: " + code;
    }
}

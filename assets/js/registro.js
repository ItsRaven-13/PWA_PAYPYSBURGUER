import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

export function initializeRegistro() {
  const appDiv = document.getElementById("app");
  if (!appDiv) {
    console.error("ERROR: No existe #app!");
    return;
  }

  appDiv.innerHTML = `
    <div class="login-container">
      <img src="./assets/img/logo.png" class="logo" alt="logo">
      <h1>PAYPY'S BURGUER</h1>
      <div class="card">
        <h2>REGISTRO</h2>
        <form id="registerForm">
          <input id="regEmail" type="email" placeholder="Correo electrónico" required>
          <input id="regPassword" type="password" placeholder="Contraseña" required>
          <input id="regConfirmPassword" type="password" placeholder="Confirmar contraseña" required>
          <p id="registroError" class="error"></p>
          <button type="submit" id="registerBtn" class="login-btn">
            <span id="btnText">REGISTRARSE</span>
            <div id="btnSpinner" class="btn-spinner" style="display:none;"></div>
          </button>
        </form>
        <a href="#" id="backToLogin">¿Ya tienes cuenta? Inicia sesión</a>
      </div>
    </div>
  `;

  // Ahora que el HTML está en el DOM, buscar elementos
  const emailInput = document.getElementById("regEmail");
  const passwordInput = document.getElementById("regPassword");
  const confirmPasswordInput = document.getElementById("regConfirmPassword");
  const errorDiv = document.getElementById("registroError");
  const registerForm = document.getElementById("registerForm");
  const backToLogin = document.getElementById("backToLogin");

  if (backToLogin) {
    backToLogin.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        const mod = await import(`./login.js?v=${Date.now()}`);
        if (typeof mod.initializeLogin === "function") {
          mod.initializeLogin();
        } else {
          window.location.href = "index.html";
        }
      } catch (err) {
        console.error("Error cargando módulo de login:", err);
        window.location.href = "index.html";
      }
    });
  }

  if (!registerForm) {
    console.error("ERROR: No existe #registerForm");
    return;
  }

  registerForm.onsubmit = async (e) => {
    e.preventDefault();

    const registerBtn = document.getElementById("registerBtn");
    const btnText = document.getElementById("btnText");
    const btnSpinner = document.getElementById("btnSpinner");
    if (registerBtn) registerBtn.disabled = true;
    if (btnText) btnText.style.display = "none";
    if (btnSpinner) btnSpinner.style.display = "block";
    if (errorDiv) errorDiv.textContent = "";

    const email = emailInput?.value.trim() || "";
    const password = passwordInput?.value.trim() || "";
    const confirmPassword = confirmPasswordInput?.value.trim() || "";

    try {
      if (!email || !password || !confirmPassword) {
        if (errorDiv) errorDiv.textContent = "Completa todos los campos.";
        return;
      }

      if (password !== confirmPassword) {
        if (errorDiv) errorDiv.textContent = "Las contraseñas no coinciden.";
        return;
      }

      if (password.length < 6) {
        if (errorDiv) errorDiv.textContent = "La contraseña debe tener al menos 6 caracteres.";
        return;
      }

      // Asegurar persistencia antes de crear usuario
      await setPersistence(auth, browserLocalPersistence);

      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      // Guardar perfil en Firestore
      await setDoc(doc(db, "users", uid), {
        email: cred.user.email,
        rol: "usuario",
        fechaRegistro: new Date()
      });

      const userSession = { uid, email: cred.user.email, rol: "usuario" };
      localStorage.setItem("userSession", JSON.stringify(userSession));
      sessionStorage.setItem("userSession", JSON.stringify(userSession));

      console.log("Registro exitoso, cargando catálogo...");

      // Cargar catálogo como SPA
      try {
        const mod = await import(`./catalogo.js?v=${Date.now()}`);
        if (typeof mod.loadCatalogo === "function") {
          mod.loadCatalogo();
          return;
        }
      } catch (err) {
        console.error("Error cargando catálogo:", err);
      }

      // Fallback
      window.location.href = "catalogo.html";

    } catch (err) {
      console.error("Error en registro:", err);
      if (errorDiv) {
        let mensaje = "Error al registrarse.";
        if (err.code === "auth/email-already-in-use") mensaje = "Este correo ya está registrado.";
        else if (err.code === "auth/invalid-email") mensaje = "Correo inválido.";
        else if (err.code === "auth/weak-password") mensaje = "Contraseña muy débil.";
        else if (err.code === "auth/operation-not-allowed") mensaje = "Registro no permitido.";
        errorDiv.textContent = mensaje;
      } else {
        alert("Error: " + (err.message || "No se pudo registrar."));
      }
    } finally {
      if (registerBtn) registerBtn.disabled = false;
      if (btnText) btnText.style.display = "inline";
      if (btnSpinner) btnSpinner.style.display = "none";
    }
  };
}
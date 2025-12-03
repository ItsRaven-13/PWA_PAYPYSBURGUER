// firebase.js - Verificar configuración
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAlP6ZdVtR6pQfn5xtyTxz98K_IMXcJwzA",
  authDomain: "paypysburgersapp-1a8ed.firebaseapp.com",
  projectId: "paypysburgersapp-1a8ed",
  storageBucket: "paypysburgersapp-1a8ed.firebasestorage.app",
  messagingSenderId: "538072887394",
  appId: "1:538072887394:web:ee0fec620d348d00c9e13b",
  measurementId: "G-1N6M30EKR9"
};

// Intentar establecer persistencia local para que la sesión sobreviva cierres del navegador
setPersistence(auth, browserLocalPersistence).catch(err => {
  console.warn("No se pudo establecer persistencia de Auth:", err);
});

export { app, auth, db };
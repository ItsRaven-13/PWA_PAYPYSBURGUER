// firebase.js - Verificar configuración
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyAlP6ZdVtR6pQfn5xtyTxz98K_IMXcJwzA",
  authDomain: "paypysburgersapp-1a8ed.firebaseapp.com",
  projectId: "paypysburgersapp-1a8ed",
  storageBucket: "paypysburgersapp-1a8ed.firebasestorage.app",
  messagingSenderId: "538072887394",
  appId: "1:538072887394:web:ee0fec620d348d00c9e13b",
  measurementId: "G-1N6M30EKR9"
};

// Inicializar Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// session.js - Verificar si el usuario está logueado
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

export function checkAuth() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                resolve(user);
            } else {
                resolve(null);
            }
        });
    });
}

export function getCurrentUser() {
    const session = sessionStorage.getItem('userSession');
    return session ? JSON.parse(session) : null;
}

export function logout() {
    sessionStorage.removeItem('userSession');
    // Firebase signOut se manejaría en otro archivo
}
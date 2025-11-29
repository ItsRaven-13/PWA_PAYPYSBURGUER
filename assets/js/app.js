// app.js
import "./firebase.js";

// Registrar SW
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js")
        .then(() => console.log("Service Worker registrado"))
        .catch(err => console.error("SW error:", err));
}

const app = document.getElementById("app");

// Router básico según hash
function router() {
    const route = window.location.hash.replace("#", "") || "login";

    switch (route) {
        case "login":
            import("./login.js").then(m => m.default());
            break;

        case "catalogo":
            import("./catalogo.js").then(m => m.default());
            break;

        case "admin":
            import("./admin.js").then(m => m.default());
            break;

        case "registro":
            import("./registro.js").then(m => m.default());
            break;

        default:
            import("./login.js").then(m => m.default());
            break;
    }
}

// Cargar vista
window.addEventListener("hashchange", router);
window.addEventListener("load", () => {
    document.getElementById("loading").style.display = "none";
    router();
});

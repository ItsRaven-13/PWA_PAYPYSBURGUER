// ...existing code...
export function loadCatalogo() {
    const app = document.getElementById("app");
    if (!app) {
        console.error("ERROR: No existe #app");
        return;
    }

    // Comprobar sesión guardada
    const session = (() => {
        try {
            return JSON.parse(sessionStorage.getItem("userSession") || "null");
        } catch (e) {
            return null;
        }
    })();

    if (!session) {
        // Si no hay sesión, volver al login (SPA fallback)
        try {
            // Intentar cargar el módulo de login en SPA
            import(`./login.js?v=${Date.now()}`).then(mod => {
                if (typeof mod.initializeLogin === "function") {
                    mod.initializeLogin();
                } else {
                    window.location.href = "./index.html";
                }
            }).catch(() => window.location.href = "./index.html");
        } catch {
            window.location.href = "./index.html";
        }
        return;
    }

    app.innerHTML = `
        <div class="catalogo-container">
            <header class="catalogo-header">
                <img src="./assets/img/logo.png" class="logo" alt="logo">
                <div class="catalogo-usuario">
                    <strong>${session.email}</strong>
                    <button id="btnCerrarSesion" class="logout-btn">Cerrar sesión</button>
                </div>
            </header>

            <h1>Catálogo de productos</h1>
            <p>Bienvenido al menú 🍔</p>

            <div class="productos">
                <div class="producto">
                    <img src="./assets/img/hd_r.png" alt="Hamburguesa Clásica">
                    <h3>Hamburguesa Clásica</h3>
                    <p>$55</p>
                </div>

                <div class="producto">
                    <img src="./assets/img/h_m.png" alt="Hamburguesa Monster">
                    <h3>Hamburguesa Monster</h3>
                    <p>$95</p>
                </div>

                <div class="producto">
                    <img src="./assets/img/a_a.png" alt="Alitas">
                    <h3>Alitas</h3>
                    <p>$65</p>
                </div>
            </div>
        </div>
    `;

    // Manejar cerrar sesión (SPA-friendly)
    const btnCerrar = document.getElementById("btnCerrarSesion");
    if (btnCerrar) {
        btnCerrar.addEventListener("click", async () => {
            sessionStorage.removeItem("userSession");
            // Intentar volver al login como SPA
            try {
                const mod = await import(`./login.js?v=${Date.now()}`);
                if (typeof mod.initializeLogin === "function") {
                    mod.initializeLogin();
                    return;
                }
            } catch (err) {
                console.error("No se pudo cargar módulo login:", err);
            }
            // Fallback: recargar index
            window.location.href = "./index.html";
        });
    }
}

// Auto-carga si se sirve una página separada catalogo.html
if (window.location.pathname.includes("catalogo.html")) {
    loadCatalogo();
}
// ...existing code...
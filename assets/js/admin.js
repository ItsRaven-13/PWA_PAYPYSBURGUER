export function loadAdminPanel() {
    const app = document.getElementById("app");

    app.innerHTML = `
        <div class="admin-container">
            <h1>Panel de Administración</h1>

            <h3>Bienvenido Administrador</h3>

            <button id="btnCerrarSesion" class="logout-btn">
                Cerrar sesión
            </button>

            <div class="admin-secciones">
                <button class="admin-btn">Ver Pedidos</button>
                <button class="admin-btn">Inventario</button>
                <button class="admin-btn">Usuarios</button>
            </div>
        </div>
    `;

    document.getElementById("btnCerrarSesion").onclick = () => {
        sessionStorage.removeItem("userSession");
        window.location.href = "./index.html";
    };
}

// Cargar automáticamente si estamos en admin.html
if (window.location.pathname.includes("admin.html")) {
    loadAdminPanel();
}

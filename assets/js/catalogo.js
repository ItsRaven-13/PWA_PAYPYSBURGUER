import { auth } from "./firebase.js";

export function loadCatalogo() {
    const app = document.getElementById("app");

    app.innerHTML = `
        <div class="catalogo-container">
            <h1>Catálogo de productos</h1>

            <p>Bienvenido al menú 🍔</p>

            <button id="btnCerrarSesion" class="logout-btn">Cerrar sesión</button>

            <div class="productos">
                <div class="producto">
                    <img src="./assets/img/burger1.png">
                    <h3>Hamburguesa Clásica</h3>
                    <p>$55</p>
                </div>

                <div class="producto">
                    <img src="./assets/img/burger2.png">
                    <h3>Hamburguesa Monster</h3>
                    <p>$95</p>
                </div>

                <div class="producto">
                    <img src="./assets/img/wings.png">
                    <h3>Alitas</h3>
                    <p>$65</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById("btnCerrarSesion").onclick = () => {
        sessionStorage.removeItem("userSession");
        window.location.href = "./index.html";
    };
}

// Auto-carga si nos llaman desde otra página
if (window.location.pathname.includes("catalogo.html")) {
    loadCatalogo();
}

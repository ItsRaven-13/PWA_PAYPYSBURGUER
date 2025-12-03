// ...existing code...
import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { carrito } from "./carrito.js";

function getStoredSession() {
  try {
    const s1 = localStorage.getItem("userSession");
    if (s1) return JSON.parse(s1);
    const s2 = sessionStorage.getItem("userSession");
    if (s2) return JSON.parse(s2);
  } catch (e) {
    console.error("Error parseando userSession:", e);
  }
  return null;
}

export function loadCatalogo() {
  const app = document.getElementById("app");
  if (!app) {
    console.error("ERROR: No existe #app");
    return;
  }

  const session = getStoredSession();

  if (!session) {
    console.log("No hay sesión en storage, verificando Firebase Auth...");
    onAuthStateChanged(auth, user => {
      if (user) {
        const userSession = { uid: user.uid, email: user.email, rol: "usuario" };
        localStorage.setItem("userSession", JSON.stringify(userSession));
        loadCatalogo(); // recargar ahora que hay sesión
      } else {
        console.log("No hay usuario en Firebase, mostrando login...");
        import(`./login.js?v=${Date.now()}`).then(mod => {
          if (typeof mod.initializeLogin === "function") mod.initializeLogin();
          else window.location.href = "./index.html";
        }).catch(() => window.location.href = "./index.html");
      }
    });
    return;
  }

  // Productos (coinciden con el HTML que pediste)
  const productos = [
    { id: 1, nombre: "Alitas", precio: 80, img: "./assets/img/alitas.png" },
    { id: 2, nombre: "Alitas Atómicas", precio: 80, img: "./assets/img/a_a.png" },
    { id: 3, nombre: "Alitas BBQ", precio: 80, img: "./assets/img/a_bbq.png" },
    { id: 4, nombre: "Alitas BBQ Chipotle", precio: 80, img: "./assets/img/a_bbqch.png" },
    { id: 5, nombre: "Alitas BBQ Hot", precio: 80, img: "./assets/img/a_bbqh.png" },
    { id: 6, nombre: "Alitas Salsa Macha", precio: 80, img: "./assets/img/a_sm.png" },
    { id: 7, nombre: "Alitas Sal y Pimienta", precio: 80, img: "./assets/img/a_sp.png" },
    { id: 8, nombre: "Hamburguesa Clásica de Res", precio: 70, img: "./assets/img/hamburguesa.png" },
    { id: 9, nombre: "Hamburguesa Clásica de Pollo", precio: 70, img: "./assets/img/h_p.png" },
    { id: 10, nombre: "Hamburguesa Monster", precio: 95, img: "./assets/img/h_m.png" },
    { id: 11, nombre: "Papas a la francesa", precio: 50, img: "./assets/img/papas.png" }
  ];

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

      <div class="catalogo-main">
        <div class="productos">
          ${productos.map(p => `
            <div class="producto" data-id="${p.id}">
              <img src="${p.img}" alt="${p.nombre}">
              <h3>${p.nombre}</h3>
              <p class="precio">$${p.precio}</p>
              <button class="btn-agregar" data-id="${p.id}" style="display:none;">Agregar al carrito</button>
            </div>
          `).join("")}
        </div>

        <aside class="carrito-sidebar">
          <h2>🛒 Tu Carrito</h2>
          <div id="carritoItems" class="carrito-items">
            <p class="carrito-vacio">El carrito está vacío</p>
          </div>
          <div class="carrito-resumen">
            <p class="carrito-total">Total: $<span id="totalCarrito">0</span></p>
            <button id="btnOrdenar" class="btn-ordenar" style="display:none;">Ordenar</button>
          </div>
        </aside>
      </div>
    </div>
  `;

  // Cerrar sesión
  const btnCerrar = document.getElementById("btnCerrarSesion");
  if (btnCerrar) {
    btnCerrar.addEventListener("click", async () => {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn("Error en signOut:", err);
      }
      localStorage.removeItem("userSession");
      sessionStorage.removeItem("userSession");

      console.log("Sesión cerrada, mostrando login...");

      try {
        const mod = await import(`./login.js?v=${Date.now()}`);
        if (typeof mod.initializeLogin === "function") {
          mod.initializeLogin();
          return;
        }
      } catch (err) {
        console.error("No se pudo cargar módulo login:", err);
      }
      window.location.href = "./index.html";
    });
  }

  // Mostrar/ocultar botón "Agregar" en hover y manejar click
  const productoElements = document.querySelectorAll(".producto");
  productoElements.forEach(el => {
    const id = parseInt(el.dataset.id, 10);
    const btn = el.querySelector(".btn-agregar");
    const prod = productos.find(p => p.id === id);

    el.addEventListener("mouseenter", () => {
      if (btn) btn.style.display = "block";
    });
    el.addEventListener("mouseleave", () => {
      if (btn) btn.style.display = "none";
    });

    if (btn) {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        carrito.agregar(prod);
        actualizarCarritoUI();
      });
    }
  });

  // Actualizar UI del carrito
  function actualizarCarritoUI() {
    const items = carrito.obtenerItems();
    const carritoItemsDiv = document.getElementById("carritoItems");
    const totalCarrito = document.getElementById("totalCarrito");
    const btnOrdenar = document.getElementById("btnOrdenar");

    if (!carritoItemsDiv || !totalCarrito) return;

    if (items.length === 0) {
      carritoItemsDiv.innerHTML = '<p class="carrito-vacio">El carrito está vacío</p>';
      btnOrdenar.style.display = "none";
    } else {
      carritoItemsDiv.innerHTML = items.map(item => `
        <div class="carrito-item" data-id="${item.id}">
          <img src="${item.img}" alt="${item.nombre}">
          <div class="carrito-item-info">
            <p class="carrito-item-nombre">${item.nombre}</p>
            <p class="carrito-item-precio">$${item.precio}</p>
          </div>
          <div class="carrito-item-controls">
            <button class="btn-menos" data-id="${item.id}">-</button>
            <span class="cantidad">${item.cantidad}</span>
            <button class="btn-mas" data-id="${item.id}">+</button>
            <button class="btn-eliminar" data-id="${item.id}">🗑️</button>
          </div>
          <p class="carrito-item-subtotal">$${(item.precio * item.cantidad).toFixed(2)}</p>
        </div>
      `).join("");
      btnOrdenar.style.display = "block";
    }

    totalCarrito.textContent = carrito.obtenerTotal().toFixed(2);

    // Listeners de controles del carrito
    document.querySelectorAll(".btn-menos").forEach(b => {
      b.addEventListener("click", () => {
        const id = parseInt(b.dataset.id, 10);
        const item = carrito.obtenerItems().find(i => i.id === id);
        if (item && item.cantidad > 1) {
          carrito.modificarCantidad(id, item.cantidad - 1);
          actualizarCarritoUI();
        } else if (item && item.cantidad === 1) {
          carrito.eliminar(id);
          actualizarCarritoUI();
        }
      });
    });

    document.querySelectorAll(".btn-mas").forEach(b => {
      b.addEventListener("click", () => {
        const id = parseInt(b.dataset.id, 10);
        const item = carrito.obtenerItems().find(i => i.id === id);
        if (item) {
          carrito.modificarCantidad(id, item.cantidad + 1);
          actualizarCarritoUI();
        }
      });
    });

    document.querySelectorAll(".btn-eliminar").forEach(b => {
      b.addEventListener("click", () => {
        const id = parseInt(b.dataset.id, 10);
        carrito.eliminar(id);
        actualizarCarritoUI();
      });
    });
  }

  // Botón Ordenar (por ahora solo placeholder)
  const btnOrdenar = document.getElementById("btnOrdenar");
  if (btnOrdenar) {
    btnOrdenar.addEventListener("click", () => {
      console.log("Orden:", carrito.obtenerItems());
      alert("Orden registrada localmente. Próximo paso: integración con Firestore/pago.");
    });
  }

  // Inicializar estado del carrito en la UI
  actualizarCarritoUI();
}

if (window.location.pathname.includes("catalogo.html")) {
  loadCatalogo();
}
// ...existing code...
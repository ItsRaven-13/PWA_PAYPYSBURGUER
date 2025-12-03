export class Carrito {
  constructor() {
    this.items = this.cargarDelStorage();
  }

  cargarDelStorage() {
    try {
      const stored = localStorage.getItem("carrito");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Error cargando carrito:", e);
      return [];
    }
  }

  guardarAlStorage() {
    localStorage.setItem("carrito", JSON.stringify(this.items));
  }

  agregar(producto) {
    // producto: { id, nombre, precio, img }
    const existe = this.items.find(item => item.id === producto.id);
    
    if (existe) {
      existe.cantidad++;
    } else {
      this.items.push({
        ...producto,
        cantidad: 1
      });
    }
    this.guardarAlStorage();
    console.log(`Agregado: ${producto.nombre}`, this.items);
  }

  eliminar(id) {
    this.items = this.items.filter(item => item.id !== id);
    this.guardarAlStorage();
  }

  modificarCantidad(id, cantidad) {
    const item = this.items.find(item => item.id === id);
    if (item) {
      item.cantidad = Math.max(1, cantidad);
      if (item.cantidad === 0) this.eliminar(id);
      else this.guardarAlStorage();
    }
  }

  obtenerTotal() {
    return this.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  }

  obtenerCantidadTotal() {
    return this.items.reduce((sum, item) => sum + item.cantidad, 0);
  }

  limpiar() {
    this.items = [];
    this.guardarAlStorage();
  }

  obtenerItems() {
    return this.items;
  }
}

export const carrito = new Carrito();
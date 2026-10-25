import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: any[] = [];

  constructor() {
    const carritoGuardado = localStorage.getItem('marketpoint_cart');
    if (carritoGuardado) {
      try {
        this.items = JSON.parse(carritoGuardado);
      } catch (e) {
        this.items = [];
      }
    }
  }

  private guardarCarrito() {
    localStorage.setItem('marketpoint_cart', JSON.stringify(this.items));
  }

  agregarItem(producto: any) {
    const idProducto = producto.id || producto.productId;
    
    // Identificamos el stock dependiendo de si viene del catálogo (.stock) o del carrito (.maxStock)
    const stockDisponible = producto.stock !== undefined ? producto.stock : producto.maxStock;
    
    const existente = this.items.find(i => i.productId === idProducto);
    
    if (existente) {
      if (existente.quantity < stockDisponible) {
        existente.quantity += 1;
      } else {
        alert(`No puedes agregar más. El stock máximo de "${existente.name}" es de ${stockDisponible} unidades.`);
      }
    } else {
      if (stockDisponible > 0) {
        this.items.push({
          productId: idProducto,
          name: producto.name,
          price: producto.price,
          quantity: 1,
          storeId: producto.storeId || 1,
          maxStock: stockDisponible // Guardamos el límite de inventario en el carrito
        });
      } else {
        alert(`El producto "${producto.name}" está agotado actualmente.`);
      }
    }
    this.guardarCarrito();
  }

  reducirItem(productId: number) {
    const index = this.items.findIndex(i => i.productId === productId);
    if (index !== -1) {
      if (this.items[index].quantity > 1) {
        this.items[index].quantity -= 1;
      } else {
        this.items.splice(index, 1); 
      }
      this.guardarCarrito();
    }
  }

  eliminarItem(productId: number) {
    this.items = this.items.filter(i => i.productId !== productId);
    this.guardarCarrito();
  }

  obtenerItems() { 
    return this.items; 
  }
  
  vaciarCarrito() { 
    this.items = []; 
    localStorage.removeItem('marketpoint_cart');
  }
}
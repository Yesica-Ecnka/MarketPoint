import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductsService } from '../../services/products';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalogo.html'
})
export class CatalogoComponent implements OnInit {
  private productsService = inject(ProductsService);
  private cartService = inject(CartService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  
  productos: any[] = [];
  cargando = true;

  terminoBusqueda = '';
  categoriaFiltro = 'Todas';

  ngOnInit() {
    this.cargarCatalogo();
  }

  cargarCatalogo() {
    this.productsService.getProducts().subscribe({
      next: (data) => {
        this.productos = data.filter((p: any) => p.isActive === true);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar el catálogo:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  get categoriasDisponibles(): string[] {
    const categorias = this.productos.map(p => p.category || 'General');
    return ['Todas', ...new Set(categorias)];
  }

  get productosFiltrados() {
    return this.productos.filter(p => {
      const coincideNombre = p.name.toLowerCase().includes(this.terminoBusqueda.toLowerCase());
      const coincideCategoria = this.categoriaFiltro === 'Todas' || (p.category || 'General') === this.categoriaFiltro;
      return coincideNombre && coincideCategoria;
    });
  }

  agregarAlCarrito(producto: any) {
    this.cartService.agregarItem(producto);
    alert(`¡${producto.name} agregado al carrito!`);
  }

  irAlCarrito() {
    this.router.navigate(['/carrito']);
  }

  get cantidadCarrito(): number {
    // Escanea los métodos más comunes del servicio de carrito para obtener el arreglo de items
    const items = (this.cartService as any).obtenerCarrito 
      ? (this.cartService as any).obtenerCarrito() 
      : (this.cartService as any).getItems 
        ? (this.cartService as any).getItems() 
        : (this.cartService as any).items || [];
    
    // Suma las cantidades si existen, o cuenta 1 por cada fila
    return items.reduce((acc: number, item: any) => acc + (item.cantidad || item.quantity || 1), 0);
  }
}
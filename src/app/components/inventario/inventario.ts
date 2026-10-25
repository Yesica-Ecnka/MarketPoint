import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ProductsService } from '../../services/products';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './inventario.html'
})
export class InventarioComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productsService = inject(ProductsService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  isSuperAdmin = false; 

  productos: any[] = [];
  cargando = true;
  mensajeExito = '';
  mensajeError = '';
  productoEnEdicion: any = null; 

  cantidadTraslado = 0;
  motivoTraslado = '';
  tipoMovimiento: 'add' | 'subtract' = 'subtract';

  movimientosKardex: any[] = [];
  cargandoKardex = false;
  movimientosGlobales: any[] = [];

  terminoBusqueda = '';
  categoriaFiltro = 'Todas';

  categoriasCatalogo: any[] = [];
  nuevaCategoria = '';

  productoForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    category: ['', Validators.required],
    description: [''],
    price: [null as any, [Validators.required, Validators.min(0.01)]],
    stock: [null as any, [Validators.required, Validators.min(0)]]
  });

  ngOnInit() {
    this.verificarRol();
    this.cargarInventario();
    this.cargarMovimientosGlobales(); 
    this.cargarCategorias();
  }

  // Utiliza exactamente la misma lógica que tu app.html
  verificarRol() {
    this.isSuperAdmin = this.authService.getRole() === 'super-admin';
  }

  cargarCategorias() {
    this.productsService.getCategories().subscribe({
      next: (data: any[]) => {
        this.categoriasCatalogo = data;
        this.cdr.detectChanges();
      }
    });
  }

  get categoriasActivas() {
    return this.categoriasCatalogo.filter(c => c.isActive);
  }

  get categoriasDisponibles(): string[] {
    const categoriasBase = this.categoriasCatalogo.map(c => c.name);
    return ['Todas', ...new Set(categoriasBase)];
  }

  get productosFiltrados() {
    return this.productos.filter(p => {
      const coincideNombre = p.name.toLowerCase().includes(this.terminoBusqueda.toLowerCase());
      const coincideCategoria = this.categoriaFiltro === 'Todas' || (p.category || 'General') === this.categoriaFiltro;
      return coincideNombre && coincideCategoria;
    });
  }

  cargarInventario() {
    this.productsService.getProducts().subscribe({
      next: (data: any) => {
        this.productos = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al cargar inventario:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarMovimientosGlobales() {
    this.productsService.getGlobalMovements().subscribe({
      next: (data: any) => {
        this.movimientosGlobales = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error al cargar mermas globales:', err)
    });
  }

  editarProducto(producto: any) {
    this.productoEnEdicion = producto;
    this.cantidadTraslado = 0;
    this.motivoTraslado = '';
    this.tipoMovimiento = 'subtract'; 
    
    this.productoForm.patchValue({
      name: producto.name,
      category: producto.category,
      description: producto.description,
      price: producto.price,
      stock: producto.stock
    });

    this.cargarKardex(producto.id);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  }

  cargarKardex(id: number) {
    this.cargandoKardex = true;
    this.productsService.getProductMovements(id).subscribe({
      next: (data: any) => {
        this.movimientosKardex = data;
        this.cargandoKardex = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al cargar Kardex:', err);
        this.cargandoKardex = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancelarEdicion() {
    this.productoEnEdicion = null;
    this.productoForm.reset(); 
    this.mensajeExito = '';
    this.mensajeError = '';
    this.movimientosKardex = [];
  }

  cambiarEstado(id: number) {
    this.productsService.toggleProductStatus(id).subscribe({
      next: () => this.cargarInventario(),
      error: (err: any) => console.error('Error al cambiar estado:', err)
    });
  }

  trasladarStock() {
    if (this.cantidadTraslado <= 0 || !this.motivoTraslado) {
      this.mostrarError({ error: { message: 'Debes ingresar una cantidad válida y escribir un motivo.' }});
      return;
    }

    this.productsService.adjustStock(this.productoEnEdicion.id, { 
      quantity: this.cantidadTraslado, 
      reason: this.motivoTraslado,
      operation: this.tipoMovimiento
    }).subscribe({
      next: (res: any) => {
        this.mensajeExito = res.message;
        this.cargarInventario();
        this.cargarKardex(this.productoEnEdicion.id); 
        this.cargarMovimientosGlobales(); 
        
        const factor = this.tipoMovimiento === 'add' ? 1 : -1;
        const nuevoStock = this.productoForm.get('stock')?.value + (this.cantidadTraslado * factor);
        this.productoForm.patchValue({ stock: nuevoStock });
        
        this.cantidadTraslado = 0;
        this.motivoTraslado = '';
      },
      error: (err: any) => this.mostrarError(err)
    });
  }

  onSubmit() {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      return;
    }

    this.mensajeExito = '';
    this.mensajeError = '';

    if (this.productoEnEdicion) {
      const dataAActualizar = {
        description: this.productoForm.value.description,
        price: this.productoForm.value.price,
        category: this.productoForm.value.category 
      };

      this.productsService.updateProduct(this.productoEnEdicion.id, dataAActualizar).subscribe({
        next: () => {
          this.mensajeExito = '¡Detalles del producto actualizados correctamente!';
          this.cancelarEdicion();
          this.cargarInventario();
        },
        error: (err: any) => this.mostrarError(err)
      });
    } else {
      this.productsService.createProduct(this.productoForm.value).subscribe({
        next: () => {
          this.mensajeExito = '¡Producto agregado exitosamente!';
          this.cancelarEdicion();
          this.cargarInventario();
          this.cargarMovimientosGlobales(); 
        },
        error: (err: any) => this.mostrarError(err)
      });
    }
  }

  agregarCategoria() {
    if (!this.nuevaCategoria.trim()) return;
    this.productsService.createCategory(this.nuevaCategoria).subscribe({
      next: () => {
        this.nuevaCategoria = '';
        this.cargarCategorias();
      },
      error: (err: any) => this.mostrarError(err)
    });
  }

  cambiarEstadoCategoria(id: number) {
    this.productsService.toggleCategoryStatus(id).subscribe({
      next: () => this.cargarCategorias(),
      error: (err: any) => console.error('Error al cambiar estado:', err)
    });
  }

  mostrarError(err: any) {
    this.mensajeError = err.error?.message || 'Hubo un error al procesar la solicitud.';
    this.cdr.detectChanges();
  }
}
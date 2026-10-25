import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { OrdersService } from '../../services/orders';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './carrito.html'
})
export class CarritoComponent implements OnInit {
  private authService = inject(AuthService);
  private ordersService = inject(OrdersService);
  private cartService = inject(CartService);
  private cdr = inject(ChangeDetectorRef);

  itemsCarrito: any[] = [];
  subtotal = 0;
  total = 0;
  mensaje = '';
  procesando = false;

  usuarioLogueado = false;
  guestEmail = '';
  mostrarFormularioInvitado = false;

  puntosDisponibles = 0;
  puntosAUsar = 0;
  descuento = 0;

  ngOnInit() {
    this.cargarDatosCarrito();
    this.usuarioLogueado = this.authService.isLoggedIn();
    
    if (this.usuarioLogueado) {
      this.cargarPuntos();
    }
  }

  // Se agrupa la carga para poder reutilizarla al modificar cantidades
  cargarDatosCarrito() {
    this.itemsCarrito = this.cartService.obtenerItems();
    this.calcularTotal();
  }

  aumentarCantidad(item: any) {
    this.cartService.agregarItem(item);
    this.cargarDatosCarrito();
  }

  reducirCantidad(item: any) {
    this.cartService.reducirItem(item.productId);
    this.cargarDatosCarrito();
  }

  eliminarProducto(item: any) {
    this.cartService.eliminarItem(item.productId);
    this.cargarDatosCarrito();
  }

  cargarPuntos() {
    this.authService.getUserProfile().subscribe({
      next: (user: any) => {
        this.puntosDisponibles = user.rewardPoints || 0;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error al cargar puntos', err)
    });
  }

  calcularTotal() {
    this.subtotal = this.itemsCarrito.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    this.actualizarDescuento();
  }

  actualizarDescuento() {
    if (this.puntosAUsar > this.puntosDisponibles) {
      this.puntosAUsar = this.puntosDisponibles;
    }
    if (this.puntosAUsar < 0) {
      this.puntosAUsar = 0;
    }
    
    this.descuento = Math.floor(this.puntosAUsar / 10);
    
    if (this.descuento > this.subtotal) {
      this.descuento = this.subtotal;
      this.puntosAUsar = this.descuento * 10;
    }

    this.total = this.subtotal - this.descuento;
  }

  iniciarPago() {
    if (!this.usuarioLogueado && !this.mostrarFormularioInvitado) {
      this.mostrarFormularioInvitado = true;
      return;
    }
    
    if (!this.usuarioLogueado && !this.guestEmail) {
      alert('Por favor, ingresa un correo electrónico para enviarte el comprobante y el seguimiento del pedido.');
      return;
    }

    this.procesarPago();
  }

  procesarPago() {
    this.procesando = true;
    this.mensaje = '';

    const ordenData = {
      storeId: this.itemsCarrito[0]?.storeId || 1,
      total: this.total,
      puntosUsados: this.puntosAUsar,
      guestEmail: this.usuarioLogueado ? null : this.guestEmail,
      status: 'Pagado',
      items: this.itemsCarrito
    };

    this.ordersService.crearOrden(ordenData).subscribe({
      next: () => {
        this.procesando = false;
        this.mensaje = '¡Pago exitoso! Tu orden ha sido registrada.';
        this.cartService.vaciarCarrito();
        this.itemsCarrito = [];
        this.total = 0;
        this.subtotal = 0;
        this.descuento = 0;
        this.puntosAUsar = 0;
        this.mostrarFormularioInvitado = false;
        this.guestEmail = '';
        
        if (this.usuarioLogueado) this.cargarPuntos();
        
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.procesando = false;
        this.cdr.detectChanges();
        const detalleError = err.error?.message || err.message || 'Error desconocido';
        alert('El servidor rechazó la orden. Razón: ' + detalleError);
      }
    });
  }
}
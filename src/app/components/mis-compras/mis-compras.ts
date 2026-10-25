import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersService } from '../../services/orders';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-mis-compras',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-compras.html'
})
export class MisComprasComponent implements OnInit {
  private ordersService = inject(OrdersService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  
  compras: any[] = [];
  cargando = true;
  puntosRecompensa = 0;
  cargandoPuntos = true;

  ngOnInit() {
    this.cargarOrdenes();
    this.cargarPuntosUsuario();
  }

  cargarOrdenes() {
    this.ordersService.obtenerMisCompras().subscribe({
      next: (data) => {
        this.compras = data;
        this.cargando = false;
        this.cdr.detectChanges(); // Fuerza a Angular a quitar el "Cargando..."
      },
      error: (err) => {
        this.cargando = false;
        this.cdr.detectChanges();
        
        // Muestra el error en pantalla si algo falla en el backend
        const detalleError = err.error?.message || err.message || 'Error desconocido';
        alert('No se pudieron cargar las órdenes. Razón: ' + detalleError);
      }
    });
  }

  cargarPuntosUsuario() {
    this.authService.getUserProfile().subscribe({
      next: (user: any) => {
        this.puntosRecompensa = user.rewardPoints || 0;
        this.cargandoPuntos = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al cargar puntos de recompensa', err);
        this.cargandoPuntos = false;
        this.cdr.detectChanges();
      }
    });
  }
}
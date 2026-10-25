import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../services/users';

@Component({
  selector: 'app-admin-tenants',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-tenants.html'
})
export class AdminTenantsComponent implements OnInit {
  private usersService = inject(UsersService);
  private cdr = inject(ChangeDetectorRef);

  tiendas: any[] = [];
  cargando = true;

  ngOnInit() {
    this.cargarInquilinos();
  }

  cargarInquilinos() {
    this.usersService.obtenerUsuarios().subscribe({
      next: (data: any[]) => {
        const inquilinosFiltrados = data.filter((u: any) => {
          const rol = (u.role || '').toLowerCase().replace(/_|-|\s/g, '');
          return u.storeId && u.storeId > 0 && rol !== 'customer' && rol !== 'superadmin';
        });

        // Agrupamos por storeId para unificar tiendas con múltiples correos
        const tiendasMap = new Map();
        for (const user of inquilinosFiltrados) {
          if (!tiendasMap.has(user.storeId)) {
            tiendasMap.set(user.storeId, {
              storeId: user.storeId,
              emails: [user.email],
              isActive: user.isActive, // Asumimos el estado del primer usuario evaluado
              userIds: [user.id]       // Guardamos los IDs para suspenderlos/activarlos en lote
            });
          } else {
            const tienda = tiendasMap.get(user.storeId);
            tienda.emails.push(user.email);
            tienda.userIds.push(user.id);
            // Mantenemos la tienda visualmente activa si al menos un usuario lo está
            if (user.isActive) tienda.isActive = true;
          }
        }

        this.tiendas = Array.from(tiendasMap.values());
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.cargando = false;
        console.error('Error al cargar inquilinos', err);
        alert('No se pudieron cargar los inquilinos.');
      }
    });
  }

  cambiarEstado(tienda: any) {
    const nuevoEstado = !tienda.isActive;
    
    // Actualizamos todos los usuarios asociados a esta tienda simultáneamente
    tienda.userIds.forEach((userId: number) => {
      this.usersService.cambiarEstado(userId).subscribe({
        next: () => {
          tienda.isActive = nuevoEstado;
          this.cdr.detectChanges();
        },
        error: () => alert(`Ocurrió un error al actualizar el usuario ID ${userId}.`)
      });
    });
  }
}
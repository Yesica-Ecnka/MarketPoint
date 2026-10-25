import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminService } from '../../services/admin'; 

@Component({
  selector: 'app-super-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './super-admin.html'
})
export class SuperAdminComponent implements OnInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);
  private http = inject(HttpClient);

  nuevaTienda = { name: '', address: '' };
  nuevoUsuario = { email: '', password: '', role: 'admin', storeId: 0 };
  
  nuevoUsuarioIndependiente = { email: '', password: '', role: 'seller', storeId: '' };
  
  mensajeExito = '';
  mensajeError = '';
  usuarios: any[] = [];
  prospectos: any[] = [];
  tiendas: any[] = []; 

  usuarioEnEdicionPass: any = null;
  nuevaPasswordEdicion = '';

  // Variables para filtros de prospectos
  terminoBusquedaProspectos: string = '';
  filtroEstadoProspecto: string = '';
  filtroFechaProspecto: string = '';

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarProspectos();
    this.cargarTiendas();
  }

  // Getter dinámico para la tabla de prospectos con múltiples filtros combinados
  get prospectosFiltrados() {
    return this.prospectos.filter((p: any) => {
      // 1. Filtro de Texto
      let coincideTexto = true;
      if (this.terminoBusquedaProspectos) {
        const termino = this.terminoBusquedaProspectos.toLowerCase();
        coincideTexto = p.businessName?.toLowerCase().includes(termino) ||
                        p.email?.toLowerCase().includes(termino) ||
                        p.contactName?.toLowerCase().includes(termino);
      }

      // 2. Filtro de Estado
      let coincideEstado = true;
      if (this.filtroEstadoProspecto) {
        const estadoActual = p.status || 'pending';
        coincideEstado = estadoActual === this.filtroEstadoProspecto;
      }

      // 3. Filtro de Fecha (compara YYYY-MM-DD)
      let coincideFecha = true;
      if (this.filtroFechaProspecto) {
        if (!p.createdAt) {
          coincideFecha = false;
        } else {
          const fechaObj = new Date(p.createdAt);
          const year = fechaObj.getFullYear();
          const month = String(fechaObj.getMonth() + 1).padStart(2, '0');
          const day = String(fechaObj.getDate()).padStart(2, '0');
          const fechaLocalStr = `${year}-${month}-${day}`;
          coincideFecha = fechaLocalStr === this.filtroFechaProspecto;
        }
      }

      return coincideTexto && coincideEstado && coincideFecha;
    });
  }

  limpiarFiltrosProspectos() {
    this.terminoBusquedaProspectos = '';
    this.filtroEstadoProspecto = '';
    this.filtroFechaProspecto = '';
  }

  cargarUsuarios() {
    this.adminService.getUsuarios().subscribe({
      next: (data: any) => {
        this.usuarios = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error al cargar usuarios', err)
    });
  }

  cargarProspectos() {
    this.adminService.getProspectos().subscribe({
      next: (data: any) => {
        this.prospectos = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error al cargar prospectos', err)
    });
  }

  cargarTiendas() {
    this.adminService.getTiendas().subscribe({
      next: (data: any) => {
        this.tiendas = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error al cargar tiendas', err)
    });
  }

  registrarNuevoTenant() {
    this.mensajeExito = '';
    this.mensajeError = '';

    this.adminService.crearTienda(this.nuevaTienda).subscribe({
      next: (tiendaGenerada: any) => {
        this.nuevoUsuario.storeId = tiendaGenerada.id;
        
        this.adminService.crearUsuario(this.nuevoUsuario).subscribe({
          next: () => {
            this.mensajeExito = `¡Éxito! La tienda "${tiendaGenerada.name}" y su usuario fueron creados.`;
            this.nuevaTienda = { name: '', address: '' };
            this.nuevoUsuario = { email: '', password: '', role: 'admin', storeId: 0 };
            this.cargarUsuarios();
            this.cargarTiendas(); 
          },
          error: (err: any) => this.mensajeError = err.error?.message || 'Error al crear el usuario.'
        });
      },
      error: (err: any) => this.mensajeError = 'Error al crear la tienda. Intenta nuevamente.'
    });
  }

  registrarUsuarioIndependiente() {
    this.mensajeExito = '';
    this.mensajeError = '';

    const payloadUsuario = {
      email: this.nuevoUsuarioIndependiente.email,
      password: this.nuevoUsuarioIndependiente.password,
      role: this.nuevoUsuarioIndependiente.role,
      storeId: Number(this.nuevoUsuarioIndependiente.storeId)
    };

    this.adminService.crearUsuario(payloadUsuario).subscribe({
      next: () => {
        this.mensajeExito = `¡Usuario ${payloadUsuario.email} creado y asignado correctamente!`;
        this.nuevoUsuarioIndependiente = { email: '', password: '', role: 'seller', storeId: '' };
        this.cargarUsuarios();
      },
      error: (err: any) => this.mensajeError = err.error?.message || 'Error al crear el usuario independiente.'
    });
  }

  cambiarRol(usuario: any, evento: any) {
    const nuevoRol = evento.target.value;
    this.adminService.actualizarRol(usuario.id, nuevoRol).subscribe({
      next: () => {
        this.mensajeExito = `Rol actualizado a '${nuevoRol}' para el usuario ${usuario.email}`;
        setTimeout(() => this.mensajeExito = '', 4000);
      },
      error: (err: any) => this.mensajeError = 'Error al actualizar el rol.'
    });
  }

  iniciarEdicionPass(usuario: any) {
    this.usuarioEnEdicionPass = usuario;
    this.nuevaPasswordEdicion = '';
  }

  guardarNuevaPassword() {
    if (!this.nuevaPasswordEdicion || this.nuevaPasswordEdicion.length < 6) {
      this.mensajeError = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    this.adminService.actualizarPassword(this.usuarioEnEdicionPass.id, this.nuevaPasswordEdicion).subscribe({
      next: () => {
        this.mensajeExito = `Contraseña actualizada para ${this.usuarioEnEdicionPass.email}`;
        this.usuarioEnEdicionPass = null;
        this.nuevaPasswordEdicion = '';
        setTimeout(() => this.mensajeExito = '', 4000);
      },
      error: (err: any) => this.mensajeError = 'Error al actualizar la contraseña.'
    });
  }

  cancelarEdicionPass() {
    this.usuarioEnEdicionPass = null;
    this.nuevaPasswordEdicion = '';
  }

  cambiarEstadoProspecto(prospecto: any, event: Event) {
    const nuevoEstado = (event.target as HTMLSelectElement).value;
    
    this.http.patch(`http://localhost:3000/prospects/${prospecto.id}/status`, { status: nuevoEstado })
      .subscribe({
        next: () => {
          prospecto.status = nuevoEstado;
        },
        error: (err: any) => {
          console.error(err);
          alert('Error al actualizar el estado del prospecto');
        }
      });
  }

  scrollTo(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
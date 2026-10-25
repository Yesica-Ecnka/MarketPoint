import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000';

  // Obtiene todas las tiendas/tenants existentes
  getTiendas() {
    return this.http.get<any[]>(`${this.baseUrl}/stores`);
  }

  // Puente para registrar un nuevo "Tenant" (Empresa/Tienda)
  crearTienda(datosTienda: { name: string; address?: string }) {
    return this.http.post(`${this.baseUrl}/stores`, datosTienda);
  }

  // Puente para registrar un usuario
  crearUsuario(datosUsuario: any) {
    return this.http.post(`${this.baseUrl}/users`, datosUsuario);
  }

  // Obtiene la lista completa de usuarios registrados
  getUsuarios() {
    return this.http.get<any[]>(`${this.baseUrl}/users`);
  }

  // Envía la petición para cambiar el rol
  actualizarRol(id: number, role: string) {
    return this.http.patch(`${this.baseUrl}/users/${id}/role`, { role });
  }

  // Obtiene las solicitudes de nuevos vendedores
  getProspectos() {
    return this.http.get<any[]>(`${this.baseUrl}/prospects`);
  }

  // Agrega esta función debajo de actualizarRol()
  actualizarPassword(id: number, password: string) {
    return this.http.patch(`${this.baseUrl}/users/${id}/password`, { password });
  }
}
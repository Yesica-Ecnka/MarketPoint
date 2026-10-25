import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private baseUrl = 'http://localhost:3000/orders';

  private getHeaders() {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  crearOrden(ordenData: any) {
    return this.http.post(this.baseUrl, ordenData, { headers: this.getHeaders() });
  }

  obtenerMisCompras() {
    return this.http.get<any[]>(`${this.baseUrl}/mis-compras`, { headers: this.getHeaders() });
  }

  obtenerOrdenesTienda() {
    return this.http.get<any[]>(`${this.baseUrl}/tienda`, { headers: this.getHeaders() });
  }
}
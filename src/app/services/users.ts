import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/users';

  obtenerUsuarios() {
    return this.http.get<any[]>(this.apiUrl);
  }

  cambiarEstado(id: number) {
    return this.http.patch<any>(`${this.apiUrl}/${id}/toggle-status`, {});
  }
}
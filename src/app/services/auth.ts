import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/auth';
  private usersUrl = 'http://localhost:3000/users';

  login(credentials: { email: string; password: string }) {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('user_data', JSON.stringify(response.user));
      })
    );
  }

  getToken() {
    return localStorage.getItem('access_token');
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getRole(): string | null {
    const userDataStr = localStorage.getItem('user_data');
    if (userDataStr) {
      const user = JSON.parse(userDataStr);
      return user.role || null;
    }
    return null;
  }

  // Método para obtener el perfil y los puntos de recompensa actualizados desde el backend
  getUserProfile() {
    return this.http.get<any>(`${this.usersUrl}/profile`);
  }

  loginConGoogle(token: string) {
    return this.http.post<any>(`${this.apiUrl}/google`, { token }).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('user_data', JSON.stringify(response.user));
      })
    );
  }
}
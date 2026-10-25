import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; 
import { AuthService } from './services/auth'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './app.html'
})
export class App { 
  title = 'MarketPoint';
  
  // Inyectamos los servicios necesarios para la sesión
  public authService = inject(AuthService);
  private router = inject(Router);

  cerrarSesion() {
    this.authService.logout(); // Borramos el token
    this.router.navigate(['/catalogo']); // Lo regresamos a la vitrina
  }
}
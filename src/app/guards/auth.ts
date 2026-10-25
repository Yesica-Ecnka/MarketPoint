import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Verificamos si hay sesión iniciada
  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // 2. Extraemos el nombre de la ruta a la que intenta entrar
  const rutaDestino = route.routeConfig?.path;

  // 3. Si es cliente y trata de entrar a áreas administrativas, lo expulsamos al catálogo
  if (authService.getRole() === 'customer') {
    if (rutaDestino === 'inventario' || rutaDestino === 'reportes' || rutaDestino === 'super-admin') {
      router.navigate(['/catalogo']);
      return false;
    }
  }

  // 4. Si pasa las validaciones, lo dejamos entrar (esto incluye a 'mis-compras')
  return true;
};
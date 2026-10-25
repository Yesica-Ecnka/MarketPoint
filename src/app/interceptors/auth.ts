import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  let token = null;

  // Verificamos si estamos en el navegador (window) antes de usar localStorage
  // Esto evita que Angular se cuelgue si usa Server-Side Rendering (SSR)
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('access_token');
  }

  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest);
  }

  return next(req);
};
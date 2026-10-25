import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http'; 
import { authInterceptor } from './interceptors/auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Agregamos withFetch() para evitar que Angular se trabe al cargar datos
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])) 
  ]
};
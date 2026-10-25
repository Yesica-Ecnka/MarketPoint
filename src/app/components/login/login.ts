import { Component, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html'
})
export class LoginComponent implements AfterViewInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMensaje = '';

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  ngAfterViewInit() {
    google.accounts.id.initialize({
      client_id: '1067075981704-bie6th3hlame87dcgr8a3g1prg3lcdke.apps.googleusercontent.com',
      callback: this.manejarRespuestaDeGoogle.bind(this)
    });
    google.accounts.id.renderButton(
      document.getElementById('btn-google'),
      { theme: 'outline', size: 'large', width: '100%' }
    );
  }

  manejarRespuestaDeGoogle(response: any) {
    this.authService.loginConGoogle(response.credential).subscribe({
      next: () => {
        this.router.navigate(['/catalogo']).then(() => window.location.reload());
      },
      error: () => this.errorMensaje = 'Error al iniciar sesión con Google.'
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMensaje = 'Por favor, completa correctamente tu correo y contraseña.';
      return;
    }

    this.errorMensaje = '';

    this.authService.login(this.loginForm.value as any).subscribe({
      next: () => {
        this.router.navigate(['/inventario']); 
      },
      error: (err) => {
        this.errorMensaje = 'Correo o contraseña incorrectos.';
        console.error('Error de login:', err);
      }
    });
  }
}
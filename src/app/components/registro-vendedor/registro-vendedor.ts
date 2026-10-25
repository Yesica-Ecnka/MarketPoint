import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-registro-vendedor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-vendedor.html'
})
export class RegistroVendedorComponent {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef); // Inyectamos el detector de cambios

  solicitud = {
    nombreEmpresa: '',
    nombreContacto: '',
    correo: '',
    telefono: '',
    categoria: '',
    comentarios: ''
  };

  enviando = false;
  mensaje = '';
  exito = false;

  enviarSolicitud() {
    if (!this.solicitud.nombreEmpresa || !this.solicitud.nombreContacto || !this.solicitud.correo) {
      this.mensaje = 'Por favor, completa todos los campos obligatorios (*).';
      this.exito = false;
      return;
    }

    this.enviando = true;
    this.mensaje = '';

    this.http.post('http://localhost:3000/prospects', this.solicitud).subscribe({
      next: () => {
        this.enviando = false;
        this.exito = true;
        this.mensaje = '¡Solicitud enviada correctamente! Nuestro equipo te contactará pronto.';
        
        this.solicitud = {
          nombreEmpresa: '',
          nombreContacto: '',
          correo: '',
          telefono: '',
          categoria: '',
          comentarios: ''
        };
        this.cdr.detectChanges(); // Forzamos actualización visual en éxito
      },
      error: (err) => {
        this.enviando = false;
        this.exito = false;
        this.mensaje = 'Hubo un error en el servidor. Revisa la consola del backend.';
        console.error('Error enviando solicitud:', err);
        this.cdr.detectChanges(); // Forzamos actualización visual en error
      }
    });
  }
}
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- Necesario para los filtros
import { OrdersService } from '../../services/orders';
import { ProductsService } from '../../services/products'; // <-- Para ver el stock
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.html'
})
export class ReportesComponent implements OnInit {
  private ordersService = inject(OrdersService);
  private productsService = inject(ProductsService);
  private cdr = inject(ChangeDetectorRef);
  
  ordenes: any[] = [];
  ordenesFiltradas: any[] = [];
  productosStock: any[] = [];
  cargando = true;

  // Variables para filtros
  filtroFecha = '';
  filtroProducto = '';
  productosUnicos: string[] = [];

  // Métricas
  totalIngresos = 0;
  ventasMes = 0;
  ordenesHoy = 0;
  chart: any;

  ngOnInit() {
    // 1. Cargar Órdenes
    this.ordersService.obtenerOrdenesTienda().subscribe({
      next: (data) => {
        this.ordenes = data;
        this.ordenesFiltradas = data;
        this.extraerProductosUnicos();
        this.calcularMetricas();
        this.cargando = false;
        this.cdr.detectChanges();
        setTimeout(() => this.generarGrafica(), 100);
      },
      error: (err) => console.error('Error al cargar órdenes:', err)
    });

    // 2. Cargar Stock de Inventario
    this.productsService.getProducts().subscribe({
      next: (prods) => {
        this.productosStock = prods;
        this.cdr.detectChanges();
      }
    });
  }

  extraerProductosUnicos() {
    const nombres = new Set<string>();
    this.ordenes.forEach(orden => {
      let items = typeof orden.items === 'string' ? JSON.parse(orden.items) : orden.items;
      items.forEach((item: any) => nombres.add(item.name));
    });
    this.productosUnicos = Array.from(nombres);
  }

  aplicarFiltros() {
    this.ordenesFiltradas = this.ordenes.filter(orden => {
      let pasaFecha = true;
      let pasaProducto = true;

      if (this.filtroFecha) {
        const fechaOrd = new Date(orden.createdAt).toISOString().split('T')[0];
        pasaFecha = fechaOrd === this.filtroFecha;
      }

      if (this.filtroProducto) {
        let items = typeof orden.items === 'string' ? JSON.parse(orden.items) : orden.items;
        pasaProducto = items.some((item: any) => item.name === this.filtroProducto);
      }

      return pasaFecha && pasaProducto;
    });

    this.calcularMetricas();
    this.generarGrafica();
  }

  limpiarFiltros() {
    this.filtroFecha = '';
    this.filtroProducto = '';
    this.aplicarFiltros();
  }

  calcularMetricas() {
    const hoy = new Date();
    this.totalIngresos = this.ordenesFiltradas.reduce((sum, ord) => sum + Number(ord.total), 0);
    
    this.ventasMes = this.ordenesFiltradas.filter(ord => {
      const fechaOrd = new Date(ord.createdAt);
      return fechaOrd.getMonth() === hoy.getMonth() && fechaOrd.getFullYear() === hoy.getFullYear();
    }).reduce((sum, ord) => sum + Number(ord.total), 0);

    this.ordenesHoy = this.ordenesFiltradas.filter(ord => {
      const fechaOrd = new Date(ord.createdAt);
      return fechaOrd.getDate() === hoy.getDate() && fechaOrd.getMonth() === hoy.getMonth() && fechaOrd.getFullYear() === hoy.getFullYear();
    }).length;
  }

  generarGrafica() {
    const canvas = document.getElementById('productosChart') as HTMLCanvasElement;
    if (!canvas) return;

    const conteoProductos: { [key: string]: number } = {};
    
    this.ordenesFiltradas.forEach(orden => {
      let items = typeof orden.items === 'string' ? JSON.parse(orden.items) : orden.items;
      items.forEach((item: any) => {
        conteoProductos[item.name] = (conteoProductos[item.name] || 0) + item.quantity;
      });
    });

    if (this.chart) {
      this.chart.destroy();
    }

    if (Object.keys(conteoProductos).length === 0) return;

    this.chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: Object.keys(conteoProductos),
        datasets: [{
          label: 'Unidades Vendidas',
          data: Object.values(conteoProductos),
          backgroundColor: '#3498db',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false }, title: { display: true, text: 'Ventas por Producto', font: { size: 16 } } }
      }
    });
  }
}
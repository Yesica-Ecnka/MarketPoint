import { Routes } from '@angular/router';

import { CatalogoComponent } from './components/catalogo/catalogo';
import { InventarioComponent } from './components/inventario/inventario';
import { CarritoComponent } from './components/carrito/carrito';
import { ReportesComponent } from './components/reportes/reportes';
import { LoginComponent } from './components/login/login';
import { SuperAdminComponent } from './components/super-admin/super-admin';
import { RegistroVendedorComponent } from './components/registro-vendedor/registro-vendedor';
import { MisComprasComponent } from './components/mis-compras/mis-compras';
import { authGuard } from './guards/auth';
// Importación corregida para que coincida exactamente con el nombre de tu archivo
import { AdminTenantsComponent } from './components/admin-tenants/admin-tenants';

export const routes: Routes = [
  { path: '', redirectTo: 'catalogo', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'catalogo', component: CatalogoComponent },
  { path: 'carrito', component: CarritoComponent },
  { path: 'vender-con-nosotros', component: RegistroVendedorComponent },
  
  // Protegemos estas rutas con canActivate
  { path: 'mis-compras', component: MisComprasComponent, canActivate: [authGuard] },
  { path: 'inventario', component: InventarioComponent, canActivate: [authGuard] },
  { path: 'reportes', component: ReportesComponent, canActivate: [authGuard] },
  { path: 'super-admin', component: SuperAdminComponent, canActivate: [authGuard] },
  { path: 'admin-tenants', component: AdminTenantsComponent, canActivate: [authGuard] }
];
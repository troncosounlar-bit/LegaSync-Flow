import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // RUTA DE AUTENTICACIÓN (Pública)
  { 
    path: 'auth', 
    title: 'LegaSync - Acceso Privado',
    loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent) 
  },

  // RUTAS PROTEGIDAS (Requieren Login)
  { 
    path: 'dashboard', 
    title: 'LegaSync - Dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) 
  },
  { 
    path: 'invoices', 
    title: 'LegaSync - Facturacion',
    canActivate: [authGuard],
    loadComponent: () => import('./features/invoices/invoices.component').then(m => m.InvoicesComponent) 
  },
  { 
    path: 'customers', 
    title: 'LegaSync - CLientes',
    canActivate: [authGuard],
    loadComponent: () => import('./features/customers/customers.component').then(m => m.CustomersComponent) 
  },

  // REDIRECCIONES Y FALLBACKS
  { 
    path: '', 
    redirectTo: 'dashboard', 
    pathMatch: 'full' 
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
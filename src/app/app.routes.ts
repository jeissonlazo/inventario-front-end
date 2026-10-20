import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Iniciar sesión · BodegaFlow',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    title: 'Crear cuenta · BodegaFlow',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Panel · BodegaFlow',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'productos',
        title: 'Productos · BodegaFlow',
        loadComponent: () =>
          import('./features/products/product-list/product-list').then((m) => m.ProductList),
      },
      {
        path: 'inventario',
        title: 'Inventario · BodegaFlow',
        loadComponent: () =>
          import('./features/inventory/inventory-list/inventory-list').then((m) => m.InventoryList),
      },
      {
        path: 'movimientos',
        title: 'Movimientos · BodegaFlow',
        loadComponent: () =>
          import('./features/movements/movement-list/movement-list').then((m) => m.MovementList),
      },
    ],
  },
  {
    path: '**',
    title: 'Página no encontrada · BodegaFlow',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];

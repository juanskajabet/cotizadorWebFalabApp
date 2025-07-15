import { Routes } from '@angular/router';
import { Login } from './pages/login/login';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  {
    path: '',
    loadComponent: () =>
      import('./layout/content/content').then(m => m.Content),
    children: [
      {
        path: 'index',
        loadComponent: () =>
          import('./pages/index/index').then(m => m.Index)
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./pages/productos/productos').then(m => m.Productos)
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('./pages/costoTiempo/configuracion').then(m => m.Configuracion)
      },
      {
        path: 'generador-cotizacion',
        loadComponent: () =>
          import('./pages/generador-cotizacion/generador-cotizacion').then(
            m => m.GeneradorCotizacion
          )
      }
    ]
  },
  { path: '**', redirectTo: 'index' }
];
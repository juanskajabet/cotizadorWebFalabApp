import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Index } from './pages/index';
import { AuthGuard } from './auth/auth-guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: Login },
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
    },{
        path: 'generador-cotizacion',
        loadComponent: () =>
            import('./pages/generador-cotizacion/generador-cotizacion').then(m => m.GeneradorCotizacion)
    }
    
];

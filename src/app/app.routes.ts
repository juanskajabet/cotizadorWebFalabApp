import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Index } from './pages/index';
import { AuthGuard } from './auth/auth-guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'index', component: Index, canActivate: [AuthGuard] },
    {
        path: 'productos',
        loadComponent: () =>
            import('./pages/productos/productos').then(m => m.Productos)
    },
    {
        path: 'configuracion',
        loadComponent: () =>
            import('./pages/costoTiempo/configuracion').then(m => m.Configuracion)
    }
    
];

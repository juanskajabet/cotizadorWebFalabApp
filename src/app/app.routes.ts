import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Index } from './pages/index';
import { AuthGuard } from './auth/auth-guard';
import { Reporte } from './pages/reporte/reporte';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'index', component: Index, canActivate: [AuthGuard] },
    { path: 'reporte', component: Reporte, canActivate: [AuthGuard] }
];

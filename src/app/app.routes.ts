import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then((module) => module.HomeComponent),
  },
  {
    path: 'user',
    loadChildren: () => import('./user/user.routes').then((module) => module.userRoutes),
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then((module) => module.adminRoutes),
  },
  {
    path: 'public',
    loadChildren: () => import('./public/public.routes').then((module) => module.publicRoutes),
  },
  { path: ':id', redirectTo: 'public/:id', pathMatch: 'full' },
  { path: 'privacy', redirectTo: 'public/privacy', pathMatch: 'full' },
];

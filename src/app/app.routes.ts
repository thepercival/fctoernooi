
import { HomeComponent } from './home/home.component';
import { userRoutes } from "./user/user.routes";
import { adminRoutes } from "./admin/admin.routes";
import { publicRoutes } from "./public/public.routes";
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'users', children: userRoutes },
  { path: 'admin', children: adminRoutes },
  { path: 'public', children: publicRoutes },
  { path: ':id', redirectTo: 'public/:id', pathMatch: 'full' },
  { path: 'privacy', redirectTo: 'public/privacy', pathMatch: 'full' },
];

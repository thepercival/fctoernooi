import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';

// import { UsersComponent }  from './user/users.component';
// import { AdminComponent }  from './admin/component';
// import { AuthGuard }  from './auth/guard';
const routes: Routes = [
  { path: '', component: HomeComponent },
  // { path: 'users', component: UsersComponent, canActivate: [AuthGuard] },
  // { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },
  { path: 'user', loadChildren: () => import('app/user/user.module').then(m => m.UserModule) },
  { path: 'admin', loadChildren: () => import('app/admin/admin.module').then(m => m.AdminModule) },
  { path: 'toernooi', loadChildren: () => import('app/tournament/tournament.module').then(m => m.TournamentModule) },
  { path: ':id', redirectTo: '/toernooi/view/:id', pathMatch: 'full' },
  /*{ path: '', redirectTo: '/home', pathMatch: 'full' },*/
  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class RoutingModule { }


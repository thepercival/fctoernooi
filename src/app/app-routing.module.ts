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
  { path: 'user', loadChildren: 'app/user/user.module#UserModule' },
  { path: 'admin', loadChildren: 'app/admin/admin.module#AdminModule' },
  { path: 'toernooi', loadChildren: 'app/tournament/tournament.module#TournamentModule' },
  { path: ':id', redirectTo: '/toernooi/view/:id', pathMatch: 'full' },
  /*{ path: '', redirectTo: '/home', pathMatch: 'full' },*/
  // // otherwise redirect to home
  { path: '**', redirectTo: '' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class RoutingModule { }


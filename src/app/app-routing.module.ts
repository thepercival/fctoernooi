import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'user', loadChildren: () => import('./user/user.module').then(m => m.UserModule) },
  { path: 'toernooi', loadChildren: () => import('./tournament/tournament.module').then(m => m.TournamentModule) },
  { path: ':id', redirectTo: '/toernooi/view/:id', pathMatch: 'full' },
  /*{ path: '', redirectTo: '/home', pathMatch: 'full' },*/
  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled'/*, anchorScrolling: 'enabled'*/, preloadingStrategy: PreloadAllModules
  })],
  exports: [RouterModule]
})
export class RoutingModule { }


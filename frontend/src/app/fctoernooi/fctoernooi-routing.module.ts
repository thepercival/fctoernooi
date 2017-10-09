import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TournamentNewComponent } from './tournament/new.component';
import { TournamentHomeComponent } from './tournament/home.component';

const routes: Routes = [
  { path: 'nieuw',  component: TournamentNewComponent },
  { path: 'home',  component: TournamentHomeComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FctoernooiRoutingModule { }

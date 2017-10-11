import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TournamentNewComponent } from './tournament/new/new.component';
import { TournamentHomeComponent } from './tournament/home/home.component';
import { TournamentStructureComponent } from './tournament/structure/structure.component';

const routes: Routes = [
  { path: 'nieuw',  component: TournamentNewComponent },
  { path: 'home',  component: TournamentHomeComponent },
  // { path: 'competitors',  component: TournamentCompetitorsComponent },
  { path: 'structure',  component: TournamentStructureComponent }
  // { path: 'planning',  component: TournamentPlanningComponent },
  // { path: 'settings',  component: TournamentSettingsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FctoernooiRoutingModule { }

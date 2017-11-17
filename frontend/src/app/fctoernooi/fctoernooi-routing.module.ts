import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TournamentNewComponent } from './tournament/new/new.component';
import { TournamentEditComponent } from './tournament/edit/edit.component';
import { TournamentHomeComponent } from './tournament/home/home.component';
import { TournamentStructureComponent } from './tournament/structure/main.component';
import { TournamentPlanningComponent } from './tournament/planning/main.component';
import { TournamentCompetitorsComponent } from './tournament/competitors/competitors.component';
import { AuthguardService } from '../auth/authguard.service';

const routes: Routes = [
  { path: 'nieuw',  component: TournamentNewComponent },
  { path: 'edit/:id',  component: TournamentEditComponent },
  { path: 'home/:id',  component: TournamentHomeComponent, canActivate: [AuthguardService] },
  { path: 'competitors/:id',  component: TournamentCompetitorsComponent, canActivate: [AuthguardService] },
  { path: 'structure/:id',  component: TournamentStructureComponent, canActivate: [AuthguardService] },
  { path: 'planning/:id',  component: TournamentPlanningComponent, canActivate: [AuthguardService] },
  // { path: 'settings',  component: TournamentSettingsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FctoernooiRoutingModule { }

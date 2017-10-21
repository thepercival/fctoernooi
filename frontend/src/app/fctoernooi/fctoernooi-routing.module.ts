import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TournamentNewComponent } from './tournament/new/new.component';
import { TournamentHomeComponent } from './tournament/home/home.component';
import { TournamentStructureComponent } from './tournament/structure/main.component';
import { AuthguardService } from '../auth/authguard.service';

const routes: Routes = [
  { path: 'nieuw',  component: TournamentNewComponent },
    { path: 'home/:id',  component: TournamentHomeComponent, canActivate: [AuthguardService] },
  // { path: 'competitors',  component: TournamentCompetitorsComponent },
  { path: 'structure/:id',  component: TournamentStructureComponent }
  // { path: 'planning',  component: TournamentPlanningComponent },
  // { path: 'settings',  component: TournamentSettingsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FctoernooiRoutingModule { }

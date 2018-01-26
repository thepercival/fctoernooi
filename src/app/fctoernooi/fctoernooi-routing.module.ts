import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AuthguardService } from '../auth/authguard.service';
import { TournamentCompetitorsComponent } from './tournament/competitors/competitors.component';
import { TournamentEditComponent } from './tournament/edit/edit.component';
import { TournamentGameEditComponent } from './tournament/game/edit.component';
import { TournamentHomeComponent } from './tournament/home/home.component';
import { TournamentNewComponent } from './tournament/new/new.component';
import { TournamentPlanningComponent } from './tournament/planning/main.component';
import { TournamentRefereeEditComponent } from './tournament/referee/edit.component';
import { TournamentStructureComponent } from './tournament/structure/main.component';
import { TournamentViewComponent } from './tournament/view/view.component';

const routes: Routes = [
  { path: 'view/:id', component: TournamentViewComponent },
  { path: 'new', component: TournamentNewComponent },
  { path: 'edit/:id', component: TournamentEditComponent },
  { path: 'home/:id', component: TournamentHomeComponent, canActivate: [AuthguardService] },
  { path: 'competitors/:id', component: TournamentCompetitorsComponent, canActivate: [AuthguardService] },
  { path: 'structure/:id', component: TournamentStructureComponent, canActivate: [AuthguardService] },
  { path: 'planning/:id', component: TournamentPlanningComponent, canActivate: [AuthguardService] },
  { path: 'gameedit/:id/:gameId', component: TournamentGameEditComponent, canActivate: [AuthguardService] },
  { path: 'refereeedit/:id/:refereeId', component: TournamentRefereeEditComponent, canActivate: [AuthguardService] },
  // { path: 'settings',  component: TournamentSettingsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes), FormsModule, ReactiveFormsModule],
  exports: [RouterModule]
})
export class FctoernooiRoutingModule { }

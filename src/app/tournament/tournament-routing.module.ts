import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AuthguardService } from '../auth/authguard.service';
import { TournamentCompetitorEditComponent } from './competitor/edit.component';
import { CompetitorListComponent } from './competitor/list.component';
import { TournamentEditComponent } from './edit/edit.component';
import { FieldListComponent } from './field/list.component';
import { TournamentFilterComponent } from './filter/filter.component';
import { TournamentGameEditComponent } from './game/edit.component';
import { GameListComponent } from './game/list.component';
import { TournamentHomeComponent } from './home/home.component';
import { TournamentLiveboardComponent } from './liveboard/liveboard.component';
import { TournamentNewComponent } from './new/new.component';
import { TournamentRefereeEditComponent } from './referee/edit.component';
import { RefereeListComponent } from './referee/list.component';
import { RoundsSettingsComponent } from './settings/rounds.component';
import { TournamentSponsorEditComponent } from './sponsor/edit.component';
import { SponsorListComponent } from './sponsor/list.component';
import { TournamentStructureComponent } from './structure/main.component';
import { TournamentStructureViewComponent } from './structure/view.component';
import { TournamentViewComponent } from './view/view.component';

const routes: Routes = [
  { path: 'view/:id', component: TournamentViewComponent },
  { path: 'liveboard/:id', component: TournamentLiveboardComponent },
  { path: 'new', component: TournamentNewComponent },
  { path: 'edit/:id', component: TournamentEditComponent },
  { path: 'filter/:id', component: TournamentFilterComponent },
  { path: ':id', component: TournamentHomeComponent, canActivate: [AuthguardService] },
  { path: 'competitors/:id', component: CompetitorListComponent, canActivate: [AuthguardService] },
  { path: 'structure/:id', component: TournamentStructureComponent, canActivate: [AuthguardService] },
  { path: 'structureview/:id', component: TournamentStructureViewComponent },
  { path: 'games/:id', component: GameListComponent, canActivate: [AuthguardService] },
  { path: 'gameedit/:id/:gameId', component: TournamentGameEditComponent, canActivate: [AuthguardService] },
  { path: 'roundssettings/:id/:roundNumber', component: RoundsSettingsComponent, canActivate: [AuthguardService] },
  { path: 'fields/:id', component: FieldListComponent, canActivate: [AuthguardService] },
  { path: 'referees/:id', component: RefereeListComponent, canActivate: [AuthguardService] },
  { path: 'refereeedit/:id/:refereeId', component: TournamentRefereeEditComponent, canActivate: [AuthguardService] },
  { path: 'sponsors/:id', component: SponsorListComponent, canActivate: [AuthguardService] },
  { path: 'sponsoredit/:id/:sponsorId', component: TournamentSponsorEditComponent, canActivate: [AuthguardService] },
  { path: 'competitoredit/:id/:poulePlaceId', component: TournamentCompetitorEditComponent, canActivate: [AuthguardService] }
];

@NgModule({
  imports: [RouterModule.forChild(routes), FormsModule, ReactiveFormsModule],
  exports: [RouterModule]
})
export class TournamentRoutingModule { }

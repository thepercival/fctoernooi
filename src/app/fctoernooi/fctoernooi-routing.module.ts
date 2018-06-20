import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AuthguardService } from '../auth/authguard.service';
import { TournamentCompetitorEditComponent } from './tournament/competitor/edit.component';
import { CompetitorListComponent } from './tournament/competitor/list.component';
import { TournamentEditComponent } from './tournament/edit/edit.component';
import { FieldListComponent } from './tournament/field/list.component';
import { TournamentFilterComponent } from './tournament/filter/filter.component';
import { TournamentGameEditComponent } from './tournament/game/edit.component';
import { GameListComponent } from './tournament/game/list.component';
import { TournamentHomeComponent } from './tournament/home/home.component';
import { TournamentNewComponent } from './tournament/new/new.component';
import { TournamentRefereeEditComponent } from './tournament/referee/edit.component';
import { RefereeListComponent } from './tournament/referee/list.component';
import { RoundsSettingsComponent } from './tournament/settings/rounds.component';
import { TournamentSponsorEditComponent } from './tournament/sponsor/edit.component';
import { SponsorListComponent } from './tournament/sponsor/list.component';
import { TournamentStructureComponent } from './tournament/structure/main.component';
import { TournamentViewTvComponent } from './tournament/view/tv.component';
import { TournamentViewComponent } from './tournament/view/view.component';

const routes: Routes = [
  { path: 'view/:id', component: TournamentViewComponent },
  { path: 'viewtv/:id', component: TournamentViewTvComponent },
  { path: 'new', component: TournamentNewComponent },
  { path: 'edit/:id', component: TournamentEditComponent },
  { path: 'filter/:id', component: TournamentFilterComponent },
  { path: ':id', component: TournamentHomeComponent, canActivate: [AuthguardService] },
  { path: 'competitors/:id', component: CompetitorListComponent, canActivate: [AuthguardService] },
  { path: 'structure/:id', component: TournamentStructureComponent, canActivate: [AuthguardService] },
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
export class FctoernooiRoutingModule { }

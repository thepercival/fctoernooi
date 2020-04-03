import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AuthguardService } from '../lib/auth/authguard.service';
import { CompetitorEditComponent } from './competitor/edit.component';
import { CompetitorListComponent } from './competitor/list.component';
import { FieldEditComponent } from './field/edit.component';
import { FieldListComponent } from './field/list.component';
import { GameEditComponent } from './game/edit.component';
import { HomeComponent } from './home/home.component';
import { NewComponent } from './new/new.component';
import { StartBreakComponent } from './startbreak/startbreak.component';
import { GameListComponent } from './game/list.component';
import { PlanningConfigComponent } from './planningconfig/edit.component';
import { RefereeEditComponent } from './referee/edit.component';
import { RefereeListComponent } from './referee/list.component';
import { SponsorEditComponent } from './sponsor/edit.component';
import { SponsorListComponent } from './sponsor/list.component';
import { SportConfigEditComponent } from './sportconfig/edit.component';
import { SportConfigListComponent } from './sportconfig/list.component';
import { StructureEditComponent } from './structure/edit.component';
import { SportScoreEditComponent } from './sportscore/edit.component';
import { LockerRoomsComponent } from '../shared/tournament/lockerrooms/lockerrooms.component';

const routes: Routes = [
  { path: 'new', component: NewComponent },
  { path: ':id', component: HomeComponent, canActivate: [AuthguardService] },
  { path: 'competitors/:id', component: CompetitorListComponent, canActivate: [AuthguardService] },
  { path: 'competitor/:id/:placeId', component: CompetitorEditComponent, canActivate: [AuthguardService] },
  { path: 'games/:id', component: GameListComponent, canActivate: [AuthguardService] },
  { path: 'game/:id/:gameId', component: GameEditComponent, canActivate: [AuthguardService] },
  { path: 'fields/:id', component: FieldListComponent, canActivate: [AuthguardService] },
  { path: 'field/:id/:number', component: FieldEditComponent, canActivate: [AuthguardService] },
  { path: 'lockerrooms/:id', component: LockerRoomsComponent, canActivate: [AuthguardService] },
  { path: 'planningconfig/:id/:roundNumber', component: PlanningConfigComponent, canActivate: [AuthguardService] },
  { path: 'referees/:id', component: RefereeListComponent, canActivate: [AuthguardService] },
  { path: 'referee/:id/:rank', component: RefereeEditComponent, canActivate: [AuthguardService] },
  { path: 'sponsors/:id', component: SponsorListComponent, canActivate: [AuthguardService] },
  { path: 'sponsor/:id/:sponsorId', component: SponsorEditComponent, canActivate: [AuthguardService] },
  { path: 'sportconfigs/:id', component: SportConfigListComponent, canActivate: [AuthguardService] },
  { path: 'sportconfig/:id/:sportConfigId', component: SportConfigEditComponent, canActivate: [AuthguardService] },
  { path: 'sportscore/:id/:sportConfigId', component: SportScoreEditComponent, canActivate: [AuthguardService] },
  { path: 'startbreak/:id', component: StartBreakComponent, canActivate: [AuthguardService] },
  { path: 'structure/:id', component: StructureEditComponent, canActivate: [AuthguardService] },
];

@NgModule({
  imports: [RouterModule.forChild(routes), ReactiveFormsModule],
  exports: [RouterModule]
})
export class RoutingModule { }

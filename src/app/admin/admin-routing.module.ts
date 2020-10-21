import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AuthguardService } from '../lib/auth/authguard.service';
import { CompetitorEditComponent } from './competitor/edit.component';
import { CompetitorListComponent } from './competitor/list.component';
import { FieldListComponent } from './sportconfig/field/fieldlist.component';
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
import { AuthorizationListComponent } from './authorization/list.component';
import { AuthorizationAddComponent } from './authorization/add.component';

const routes: Routes = [
  { path: 'new', component: NewComponent }, // ALL ROLES
  { path: ':id', component: HomeComponent, canActivate: [AuthguardService] }, // GAMERESULTADMIN, ADMIN
  { path: 'competitors/:id', component: CompetitorListComponent, canActivate: [AuthguardService] }, // ADMIN
  { path: 'competitor/:id/:pouleNr/:placeNr', component: CompetitorEditComponent, canActivate: [AuthguardService] }, // ADMIN
  { path: 'games/:id', component: GameListComponent, canActivate: [AuthguardService] }, // GAMERESULTADMIN
  { path: 'game/:id/:gameId', component: GameEditComponent, canActivate: [AuthguardService] }, // GAMERESULTADMIN
  { path: 'fields/:id', component: FieldListComponent, canActivate: [AuthguardService] }, // ADMIN
  { path: 'lockerrooms/:id', component: LockerRoomsComponent, canActivate: [AuthguardService] }, // ADMIN
  { path: 'planningconfig/:id/:startRoundNumber', component: PlanningConfigComponent, canActivate: [AuthguardService] }, // ADMIN
  { path: 'referees/:id', component: RefereeListComponent, canActivate: [AuthguardService] }, // ADMIN
  { path: 'referee/:id/:rank', component: RefereeEditComponent, canActivate: [AuthguardService] }, // ADMIN
  { path: 'referees/:id', component: RefereeListComponent, canActivate: [AuthguardService] }, // ADMIN
  { path: 'authorizations/:id', component: AuthorizationListComponent, canActivate: [AuthguardService] }, // ROLEADMIN
  { path: 'authorization/:id', component: AuthorizationAddComponent, canActivate: [AuthguardService] }, // ROLEADMIN
  { path: 'sponsors/:id', component: SponsorListComponent, canActivate: [AuthguardService] }, // ADMIN
  { path: 'sponsor/:id/:sponsorId', component: SponsorEditComponent, canActivate: [AuthguardService] }, // ADMIN
  { path: 'sportconfigs/:id', component: SportConfigListComponent, canActivate: [AuthguardService] }, // ADMIN
  { path: 'sportconfig/:id/:sportConfigId/:tabId', component: SportConfigEditComponent, canActivate: [AuthguardService] }, // ADMIN
  { path: 'sportconfig/:id/:sportConfigId/:tabId/:startRoundNumber', component: SportConfigEditComponent, canActivate: [AuthguardService] }, // ADMIN
  { path: 'startbreak/:id', component: StartBreakComponent, canActivate: [AuthguardService] }, // ADMIN
  { path: 'structure/:id', component: StructureEditComponent, canActivate: [AuthguardService] }, // ADMIN
];

@NgModule({
  imports: [RouterModule.forChild(routes), ReactiveFormsModule],
  exports: [RouterModule]
})
export class RoutingModule { }

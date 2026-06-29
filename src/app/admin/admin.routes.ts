import { Routes } from '@angular/router';
import { AuthguardService } from '../lib/auth/authguard.service';
import { AuthorizationAddComponent } from './authorization/add.component';
import { AuthorizationListComponent } from './authorization/list.component';
import { CompetitionSportEditComponent } from './competitionSport/edit.component';
import { FieldListComponent } from './competitionSport/field/fieldlist.component';
import { CompetitionSportListComponent } from './competitionSport/list.component';
import { CompetitorEditComponent } from './competitor/edit.component';
import { CompetitorListComponent } from './competitor/list.component';
import { GameAddComponent } from './game/add.component';
import { GameAgainstEditComponent } from './game/editagainst.component';
import { GameTogetherEditComponent } from './game/edittogether.component';
import { GameListComponent } from './game/list.component';
import { HomeAdminComponent } from './home/home.component';
import { HomeEditComponent } from './home/homeedit.component';
import { TournamentRulesComponent } from './home/rules.component';
import { LockerRoomsEditComponent } from './lockerrooms/lockerrooms.component';
import { TournamentNameAndThemeComponent } from './nameAndTheme/name-and-theme.component';
import { NewComponent } from './new/new.component';
import { PlanningConfigComponent } from './planningconfig/edit.component';
import { RankingEditComponent } from './ranking/edit.component';
import { RefereeEditComponent } from './referee/edit.component';
import { RefereeListComponent } from './referee/list.component';
import { TournamentRegistrationEditComponent } from './registration/registration-edit.component';
import { SponsorEditComponent } from './sponsor/edit.component';
import { SponsorListComponent } from './sponsor/list.component';
import { RecessAddComponent } from './startAndRecesses/addRecess.component';
import { StartAndRecessesComponent } from './startAndRecesses/startAndRecesses.component';
import { StructureEditComponent } from './structure/edit.component';

export const adminRoutes: Routes = [
  { path: 'new', component: NewComponent }, // ALL ROLES
  { path: ':id', component: HomeAdminComponent, canActivate: [AuthguardService] }, // GAMERESULTADMIN, ADMIN
  { path: 'competitors/:id/:tabId', component: CompetitorListComponent, canActivate: [AuthguardService] }, // ADMIN  
  { path: 'competitors/:id/:tabId/:registrationTabId', component: CompetitorListComponent, canActivate: [AuthguardService] }, // ADMIN  
  { path: 'competitor/:id/:categoryNr/:pouleNr/:placeNr', component: CompetitorEditComponent, canActivate: [AuthguardService] }, // ADMIN
  { path: 'registration/:id/:categoryNr/:registrationId', component: TournamentRegistrationEditComponent, canActivate: [AuthguardService] }, // ADMIN
  { path: 'games/:id', component: GameListComponent, canActivate: [AuthguardService] }, // GAMERESULTADMIN
  { path: 'game/new/:id/:roundNumber', component: GameAddComponent, canActivate: [AuthguardService] }, // GAMERESULTADMIN
  { path: 'gameagainst/:id/:gameId', component: GameAgainstEditComponent, canActivate: [AuthguardService] }, // GAMERESULTADMIN
  { path: 'gametogether/:id/:gameId', component: GameTogetherEditComponent, canActivate: [AuthguardService] }, // GAMERESULTADMIN
  { path: 'fields/:id', component: FieldListComponent, canActivate: [AuthguardService] }, // ADMIN
  { path: 'homeedit/:id', component: HomeEditComponent, canActivate: [AuthguardService] }, // GAMERESULTADMIN, ADMIN
  { path: 'lockerrooms/:id', component: LockerRoomsEditComponent, canActivate: [AuthguardService] }, // ADMIN
  { path: 'nameandtheme/:id', component: TournamentNameAndThemeComponent, canActivate: [AuthguardService] }, // ADMIN
  { path: 'planningconfig/:id/:startRoundNumber', component: PlanningConfigComponent, canActivate: [AuthguardService] }, // ADMIN
  { path: 'ranking/:id', component: RankingEditComponent, canActivate: [AuthguardService] }, // ADMIN
  { path: 'referees/:id', component: RefereeListComponent, canActivate: [AuthguardService] }, // ADMIN
  { path: 'referee/:id/:rank', component: RefereeEditComponent, canActivate: [AuthguardService] }, // ADMIN
  { path: 'rules/:id', component: TournamentRulesComponent, canActivate: [AuthguardService] }, // ADMIN
  { path: 'authorizations/:id', component: AuthorizationListComponent, canActivate: [AuthguardService] }, // ROLEADMIN
  { path: 'authorization/:id', component: AuthorizationAddComponent, canActivate: [AuthguardService] }, // ROLEADMIN
  { path: 'sponsors/:id', component: SponsorListComponent, canActivate: [AuthguardService] }, // ADMIN
  { path: 'sponsor/:id/:sponsorId', component: SponsorEditComponent, canActivate: [AuthguardService] }, // ADMIN
  { path: 'competitionsports/:id', component: CompetitionSportListComponent, canActivate: [AuthguardService] }, // ADMIN
  { path: 'competitionsport/:id/:competitionSportId/:tabId', component: CompetitionSportEditComponent, canActivate: [AuthguardService] }, // ADMIN
  { path: 'startandrecesses/:id', component: StartAndRecessesComponent, canActivate: [AuthguardService] }, // ADMIN
  { path: 'recess/:id', component: RecessAddComponent, canActivate: [AuthguardService] }, // ADMIN
  { path: 'structure/:id', component: StructureEditComponent, canActivate: [AuthguardService] }, // ADMIN
];
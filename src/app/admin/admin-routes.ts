import { Routes } from '@angular/router';

// import { HomeComponent } from './home/home.component';
// import { userRoutes } from "./usermodule/user.routes";
// import { poolRoutes } from "./poolmodule/pool.routes";
// import { PoolListComponent } from './poollist/poollist.component';

export const routes: Routes = [
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
  { path: 'referees/:id', component: RefereeListComponent, canActivate: [AuthguardService] }, // ADMIN
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
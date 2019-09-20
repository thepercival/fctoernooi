import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AuthguardService } from '../auth/authguard.service';
import { CompetitorEditComponent } from './competitor/edit.component';
import { CompetitorListComponent } from './competitor/list.component';
import { FieldEditComponent } from './field/edit.component';
import { FieldListComponent } from './field/list.component';
import { FilterComponent } from './filter/filter.component';
import { GameEditComponent } from './game/edit.component';
import { HomeComponent } from './home/home.component';
import { LiveboardComponent } from './liveboard/liveboard.component';
import { NewComponent } from './new/new.component';
import { PlanningEditComponent } from './planning/edit.component';
import { GameListComponent } from './planning/gamelist.component';
import { PlanningConfigComponent } from './planningconfig/edit.component';
import { RefereeEditComponent } from './referee/edit.component';
import { RefereeListComponent } from './referee/list.component';
import { SponsorEditComponent } from './sponsor/edit.component';
import { SponsorListComponent } from './sponsor/list.component';
import { SportConfigEditComponent } from './sportconfig/edit.component';
import { SportConfigListComponent } from './sportconfig/list.component';
import { StructureComponent } from './structure/main.component';
import { StructureViewComponent } from './structure/view.component';
import { ViewComponent } from './view/view.component';
import { SportScoreEditComponent } from './sportscore/edit.component';

const routes: Routes = [
  { path: 'view/:id', component: ViewComponent },
  { path: 'liveboard/:id', component: LiveboardComponent },
  { path: 'new', component: NewComponent },
  { path: 'filter/:id', component: FilterComponent },
  { path: ':id', component: HomeComponent, canActivate: [AuthguardService] },
  { path: 'competitors/:id', component: CompetitorListComponent, canActivate: [AuthguardService] },
  { path: 'structure/:id', component: StructureComponent, canActivate: [AuthguardService] },
  { path: 'structureview/:id', component: StructureViewComponent },
  { path: 'planningedit/:id', component: PlanningEditComponent, canActivate: [AuthguardService] },
  { path: 'games/:id', component: GameListComponent, canActivate: [AuthguardService] },
  { path: 'gameedit/:id/:gameId', component: GameEditComponent, canActivate: [AuthguardService] },
  { path: 'planningconfig/:id/:roundNumber', component: PlanningConfigComponent, canActivate: [AuthguardService] },
  { path: 'sportconfigs/:id', component: SportConfigListComponent, canActivate: [AuthguardService] },
  { path: 'sportconfigedit/:id/:sportConfigId', component: SportConfigEditComponent, canActivate: [AuthguardService] },
  { path: 'sportscoreedit/:id/:sportConfigId', component: SportScoreEditComponent, canActivate: [AuthguardService] },
  { path: 'fields/:id', component: FieldListComponent, canActivate: [AuthguardService] },
  { path: 'fieldedit/:id/:number', component: FieldEditComponent, canActivate: [AuthguardService] },
  { path: 'referees/:id', component: RefereeListComponent, canActivate: [AuthguardService] },
  { path: 'refereeedit/:id/:rank', component: RefereeEditComponent, canActivate: [AuthguardService] },
  { path: 'sponsors/:id', component: SponsorListComponent, canActivate: [AuthguardService] },
  { path: 'sponsoredit/:id/:sponsorId', component: SponsorEditComponent, canActivate: [AuthguardService] },
  { path: 'competitoredit/:id/:placeId', component: CompetitorEditComponent, canActivate: [AuthguardService] }
];

@NgModule({
  imports: [RouterModule.forChild(routes), ReactiveFormsModule],
  exports: [RouterModule]
})
export class RoutingModule { }

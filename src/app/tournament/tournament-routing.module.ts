import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AuthguardService } from '../auth/authguard.service';
import { CompetitorEditComponent } from './competitor/edit.component';
import { CompetitorListComponent } from './competitor/list.component';
import { EditComponent } from './edit/edit.component';
import { FieldListComponent } from './field/list.component';
import { FilterComponent } from './filter/filter.component';
import { GameEditComponent } from './game/edit.component';
import { GameListComponent } from './game/list.component';
import { HomeComponent } from './home/home.component';
import { LiveboardComponent } from './liveboard/liveboard.component';
import { NewComponent } from './new/new.component';
import { RefereeEditComponent } from './referee/edit.component';
import { RefereeListComponent } from './referee/list.component';
import { SportConfigEditComponent } from './sportconfig/edit.component';
import { SportConfigListComponent } from './sportconfig/list.component';
import { RoundsSettingsComponent } from './settings/rounds.component';
import { SponsorEditComponent } from './sponsor/edit.component';
import { SponsorListComponent } from './sponsor/list.component';
import { StructureComponent } from './structure/main.component';
import { StructureViewComponent } from './structure/view.component';
import { ViewComponent } from './view/view.component';

const routes: Routes = [
  { path: 'view/:id', component: ViewComponent },
  { path: 'liveboard/:id', component: LiveboardComponent },
  { path: 'new', component: NewComponent },
  { path: 'edit/:id', component: EditComponent },
  { path: 'filter/:id', component: FilterComponent },
  { path: ':id', component: HomeComponent, canActivate: [AuthguardService] },
  { path: 'competitors/:id', component: CompetitorListComponent, canActivate: [AuthguardService] },
  { path: 'structure/:id', component: StructureComponent, canActivate: [AuthguardService] },
  { path: 'structureview/:id', component: StructureViewComponent },
  { path: 'games/:id', component: GameListComponent, canActivate: [AuthguardService] },
  { path: 'gameedit/:id/:gameId', component: GameEditComponent, canActivate: [AuthguardService] },
  { path: 'roundssettings/:id/:roundNumber', component: RoundsSettingsComponent, canActivate: [AuthguardService] },
  { path: 'sportconfigs/:id', component: SportConfigListComponent, canActivate: [AuthguardService] },
  { path: 'sportconfigedit/:id/:sportConfigId', component: SportConfigEditComponent, canActivate: [AuthguardService] },
  { path: 'fields/:id', component: FieldListComponent, canActivate: [AuthguardService] },
  { path: 'referees/:id', component: RefereeListComponent, canActivate: [AuthguardService] },
  { path: 'refereeedit/:id/:refereeId', component: RefereeEditComponent, canActivate: [AuthguardService] },
  { path: 'sponsors/:id', component: SponsorListComponent, canActivate: [AuthguardService] },
  { path: 'sponsoredit/:id/:sponsorId', component: SponsorEditComponent, canActivate: [AuthguardService] },
  { path: 'competitoredit/:id/:placeId', component: CompetitorEditComponent, canActivate: [AuthguardService] }
];

@NgModule({
  imports: [RouterModule.forChild(routes), FormsModule, ReactiveFormsModule],
  exports: [RouterModule]
})
export class RoutingModule { }

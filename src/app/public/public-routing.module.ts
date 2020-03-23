import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AuthguardService } from '../lib/auth/authguard.service';
import { FilterComponent } from './filter/filter.component';
import { HomeComponent } from './home/home.component';
import { LiveboardComponent } from '../public/liveboard/liveboard.component';
import { PreNewComponent } from './prenew/prenew.component';
import { StructureViewComponent } from '../public/structure/view.component';
import { PlanningComponent } from './planning/view.component';
import { RankingComponent } from './ranking/view.component';

const routes: Routes = [
  { path: 'prenew', component: PreNewComponent },
  { path: ':id', component: HomeComponent, canActivate: [AuthguardService] },
  { path: 'planning/:id', component: PlanningComponent, canActivate: [AuthguardService] },
  { path: 'ranking/:id', component: RankingComponent, canActivate: [AuthguardService] },
  { path: 'structure/:id', component: StructureViewComponent, canActivate: [AuthguardService] },
  { path: 'filter/:id', component: FilterComponent },
  { path: 'liveboard/:id', component: LiveboardComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes), ReactiveFormsModule],
  exports: [RouterModule]
})
export class RoutingModule { }

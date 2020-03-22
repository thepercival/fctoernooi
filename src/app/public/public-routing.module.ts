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

const routes: Routes = [
  { path: 'liveboard/:id', component: LiveboardComponent },
  { path: 'prenew', component: PreNewComponent },
  { path: 'filter/:id', component: FilterComponent },
  { path: ':id', component: HomeComponent, canActivate: [AuthguardService] },
  { path: 'structure/:id', component: StructureViewComponent, canActivate: [AuthguardService] },
  { path: 'planning/:id', component: PlanningComponent, canActivate: [AuthguardService] }
];

@NgModule({
  imports: [RouterModule.forChild(routes), ReactiveFormsModule],
  exports: [RouterModule]
})
export class RoutingModule { }

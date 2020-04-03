import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { FilterComponent } from './filter/filter.component';
import { HomeComponent } from './home/home.component';
import { LiveboardComponent } from '../public/liveboard/liveboard.component';
import { PreNewComponent } from './prenew/prenew.component';
import { StructureViewComponent } from '../public/structure/view.component';
import { GamesComponent } from './games/view.component';
import { RankingComponent } from './ranking/view.component';
import { LockerRoomsComponent } from '../shared/tournament/lockerrooms/lockerrooms.component';

const routes: Routes = [
  { path: 'prenew', component: PreNewComponent },
  { path: ':id', component: HomeComponent },
  { path: 'games/:id', component: GamesComponent },
  { path: 'ranking/:id', component: RankingComponent },
  { path: 'structure/:id', component: StructureViewComponent },
  { path: 'filter/:id', component: FilterComponent },
  { path: 'liveboard/:id', component: LiveboardComponent },
  { path: 'lockerrooms/:id', component: LockerRoomsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes), ReactiveFormsModule],
  exports: [RouterModule]
})
export class RoutingModule { }

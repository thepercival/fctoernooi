import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { LiveboardComponent } from '../public/liveboard/liveboard.component';
import { PreNewComponent } from './prenew/prenew.component';
import { StructureViewComponent } from '../public/structure/view.component';
import { GamesComponent } from './games/view.component';
import { RankingViewComponent } from './ranking/view.component';
import { SelectFavoritesComponent } from './favorites/select.component';
import { PublicShellsComponent } from './shells/shells.component';

const routes: Routes = [
  { path: 'prenew', component: PreNewComponent },
  { path: 'shells', component: PublicShellsComponent },
  { path: 'games/:id', component: GamesComponent },
  { path: 'ranking/:id', component: RankingViewComponent },
  { path: 'structure/:id', component: StructureViewComponent },
  { path: 'favorites/:id', component: SelectFavoritesComponent },
  { path: 'liveboard/:id', component: LiveboardComponent },
  { path: ':id', redirectTo: 'games/:id', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes), ReactiveFormsModule],
  exports: [RouterModule]
})
export class RoutingModule { }

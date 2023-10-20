import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { LiveboardComponent } from '../public/liveboard/liveboard.component';
import { PreNewComponent } from './prenew/prenew.component';
import { StructureViewComponent } from '../public/structure/view.component';
import { GamesComponent } from './games/view.component';
import { RankingViewComponent } from './ranking/view.component';
import { SelectFavoritesComponent } from './competitors/select.component';
import { PublicShellsComponent } from './shells/shells.component';
import { ExamplesComponent } from './examples/examples.component';
import { RegistrationComponent } from './registration-form/registration-form.component';
import { PrivacyComponent } from './privacy.component';
import { HomeViewComponent } from './home/homeview.component';

const routes: Routes = [
  { path: 'prenew', component: PreNewComponent },
  { path: 'shells', component: PublicShellsComponent },
  { path: 'games/:id', component: GamesComponent },
  { path: 'home/:id', component: HomeViewComponent },
  { path: 'ranking/:id', component: RankingViewComponent },
  { path: 'structure/:id', component: StructureViewComponent },
  { path: 'competitors/:id', component: SelectFavoritesComponent },
  { path: 'liveboard/:id', component: LiveboardComponent },
  { path: 'registrationform/:id', component: RegistrationComponent },
  { path: 'examples', component: ExamplesComponent },  
  { path: 'privacy', component: PrivacyComponent },  
  { path: ':id', redirectTo: 'home/:id', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes), ReactiveFormsModule],
  exports: [RouterModule]
})
export class RoutingModule { }

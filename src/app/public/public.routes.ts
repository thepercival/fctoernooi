import { Routes } from '@angular/router';
import { SelectFavoritesComponent } from './competitors/select.component';
import { ExamplesComponent } from './examples/examples.component';
import { GamesComponent } from './games/view.component';
import { HomeViewComponent } from './home/homeview.component';
import { LiveboardComponent } from './liveboard/liveboard.component';
import { PreNewComponent } from './prenew/prenew.component';
import { PrivacyComponent } from './privacy.component';
import { RankingViewComponent } from './ranking/view.component';
import { RegistrationComponent } from './registration-form/registration-form.component';
import { PublicShellsComponent } from './shells/shells.component';
import { StructureViewComponent } from './structure/view.component';

export const publicRoutes: Routes = [
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
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CompetitionSeasonNewComponent } from './competitionseason/new.component';

const routes: Routes = [
  { path: 'nieuw',  component: CompetitionSeasonNewComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FctoernooiRoutingModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CompetitionSeasonNewComponent } from './competitionseason/new.component';

import { FctoernooiRoutingModule } from './fctoernooi-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FctoernooiRoutingModule
  ],
  declarations: [
    CompetitionSeasonNewComponent
  ]
})
export class FctoernooiModule { }

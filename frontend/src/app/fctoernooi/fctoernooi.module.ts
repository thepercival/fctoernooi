import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TournamentNewComponent } from './tournament/new.component';
import { TournamentHomeComponent } from './tournament/home.component';
import { TournamentRepository } from './tournament/repository';

import { FctoernooiRoutingModule } from './fctoernooi-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FctoernooiRoutingModule
  ],
  declarations: [
    TournamentNewComponent,
    TournamentHomeComponent
  ],
  providers: [
    TournamentRepository
  ]
})
export class FctoernooiModule { }

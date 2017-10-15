import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { TournamentNewComponent } from './tournament/new/new.component';
import { TournamentHomeComponent } from './tournament/home/home.component';
import { TournamentStructureComponent } from './tournament/structure/structure.component';
import { TournamentRepository } from './tournament/repository';
import { TournamentRoleRepository } from './tournament/role/repository';
import { RoundRepository } from 'voetbaljs/round/repository';
import { PouleRepository } from 'voetbaljs/poule/repository';
import { PoulePlaceRepository } from 'voetbaljs/pouleplace/repository';
import { TeamRepository } from 'voetbaljs/team/repository';
import { GameRepository } from 'voetbaljs/game/repository';

import { NouisliderComponent } from 'ng2-nouislider';
import { FctoernooiRoutingModule } from './fctoernooi-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FctoernooiRoutingModule,
    NgbModule
  ],
  declarations: [
    TournamentNewComponent,
    TournamentHomeComponent,
    TournamentStructureComponent,
    NouisliderComponent
  ],
  providers: [
    TournamentRepository,
    TournamentRoleRepository,
    RoundRepository,
    PouleRepository,
    PoulePlaceRepository,
    TeamRepository,
    GameRepository
  ]
})
export class FctoernooiModule { }

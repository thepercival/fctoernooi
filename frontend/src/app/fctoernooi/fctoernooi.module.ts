import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NouisliderModule } from 'ng2-nouislider';

import { TournamentNewComponent } from './tournament/new/new.component';
import { TournamentHomeComponent } from './tournament/home/home.component';
import { TournamentStructureComponent } from './tournament/structure/main.component';
import { TournamentStructureRoundComponent } from './tournament/structure/round.component';
import { TournamentRoleRepository } from './tournament/role/repository';
import { RoundRepository } from 'voetbaljs/round/repository';
import { PouleRepository } from 'voetbaljs/poule/repository';
import { PoulePlaceRepository } from 'voetbaljs/pouleplace/repository';
import { QualifyRuleRepository } from 'voetbaljs/qualifyrule/repository';
import { TeamRepository } from 'voetbaljs/team/repository';
import { GameRepository } from 'voetbaljs/game/repository';

import { FctoernooiRoutingModule } from './fctoernooi-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FctoernooiRoutingModule,
    NgbModule,
    NouisliderModule
  ],
  declarations: [
    TournamentNewComponent,
    TournamentHomeComponent,
    TournamentStructureComponent,
    TournamentStructureRoundComponent
  ],
  providers: [
    TournamentRoleRepository,
    RoundRepository,
    PouleRepository,
    PoulePlaceRepository,
    QualifyRuleRepository,
    TeamRepository,
    GameRepository
  ]
})
export class FctoernooiModule { }

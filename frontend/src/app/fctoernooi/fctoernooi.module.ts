import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DndModule } from 'ng2-dnd';
import { NouisliderModule } from 'ng2-nouislider';
import { GameRepository } from 'voetbaljs/game/repository';
import { PouleRepository } from 'voetbaljs/poule/repository';
import { PoulePlaceRepository } from 'voetbaljs/pouleplace/repository';
import { QualifyRuleRepository } from 'voetbaljs/qualifyrule/repository';
import { RoundConfigRepository } from 'voetbaljs/round/config/repository';
import { RoundRepository } from 'voetbaljs/round/repository';
import { RoundScoreConfigRepository } from 'voetbaljs/round/scoreconfig/repository';
import { StructureRepository } from 'voetbaljs/structure/repository';
import { TeamRepository } from 'voetbaljs/team/repository';

import { FctoernooiRoutingModule } from './fctoernooi-routing.module';
import { TournamentCompetitorsComponent } from './tournament/competitors/competitors.component';
import { TournamentEditComponent } from './tournament/edit/edit.component';
import { TournamentGameEditComponent } from './tournament/game/edit.component';
import { TournamentHomeComponent } from './tournament/home/home.component';
import { TournamentNewComponent } from './tournament/new/new.component';
import { TournamentPlanningFieldsComponent } from './tournament/planning/fields/component';
import { TournamentPlanningComponent } from './tournament/planning/main.component';
import { TournamentPlanningRefereesComponent } from './tournament/planning/referees/component';
import { TournamentPlanningSettingsComponent } from './tournament/planning/settings/component';
import { TournamentPlanningSelectableRoundsComponent } from './tournament/planning/settings/selectable.rounds.component';
import { TournamentPlanningViewComponent } from './tournament/planning/view/component';
import { TournamentRoleRepository } from './tournament/role/repository';
import { TournamentStructureComponent } from './tournament/structure/main.component';
import { TournamentStructureRoundComponent } from './tournament/structure/round.component';
import { TournamentViewComponent } from './tournament/view/view.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FctoernooiRoutingModule,
    NgbModule,
    NouisliderModule,
    DndModule
  ],
  declarations: [
    TournamentNewComponent,
    TournamentEditComponent,
    TournamentHomeComponent,
    TournamentStructureComponent,
    TournamentStructureRoundComponent,
    TournamentPlanningComponent,
    TournamentPlanningViewComponent,
    TournamentCompetitorsComponent,
    TournamentPlanningSettingsComponent,
    TournamentPlanningRefereesComponent,
    TournamentPlanningFieldsComponent,
    TournamentPlanningSelectableRoundsComponent,
    TournamentViewComponent,
    TournamentGameEditComponent
  ],
  providers: [
    TournamentRoleRepository,
    StructureRepository,
    RoundRepository,
    RoundConfigRepository,
    RoundScoreConfigRepository,
    PouleRepository,
    PoulePlaceRepository,
    QualifyRuleRepository,
    TeamRepository,
    GameRepository
  ]
})
export class FctoernooiModule { }

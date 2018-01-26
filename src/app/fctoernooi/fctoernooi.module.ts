import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DndModule } from 'ng2-dnd';
import { NouisliderModule } from 'ng2-nouislider';
import {
    GameRepository,
    GameScoreRepository,
    PoulePlaceRepository,
    PouleRepository,
    QualifyRuleRepository,
    RoundConfigRepository,
    RoundRepository,
    RoundScoreConfigRepository,
    StructureRepository,
    TeamRepository,
} from 'ngx-sport';

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
import { TournamentPlanningViewComponent } from './tournament/planning/view/component';
import { TournamentRefereeEditComponent } from './tournament/referee/edit.component';
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
    DndModule,
    ReactiveFormsModule/*,
    SportModule*/
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
    TournamentViewComponent,
    TournamentGameEditComponent,
    TournamentRefereeEditComponent
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
    GameRepository,
    GameScoreRepository
  ]
})
export class FctoernooiModule { }

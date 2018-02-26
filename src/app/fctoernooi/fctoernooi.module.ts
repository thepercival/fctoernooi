import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
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

import { IconManager } from '../common/iconmanager';
import { FctoernooiRoutingModule } from './fctoernooi-routing.module';
import { TournamentCompetitorEditComponent } from './tournament/competitor/edit.component';
import { CompetitorListComponent } from './tournament/competitor/list.component';
import { TournamentEditComponent } from './tournament/edit/edit.component';
import { FieldListComponent } from './tournament/field/list.component';
import { TournamentGameEditComponent } from './tournament/game/edit.component';
import { GameListComponent } from './tournament/game/list.component';
import { TournamentHomeComponent } from './tournament/home/home.component';
import { TournamentNewComponent } from './tournament/new/new.component';
import { TournamentPlanningViewComponent } from './tournament/planning/view/component';
import { TournamentRefereeEditComponent } from './tournament/referee/edit.component';
import { RefereeListComponent } from './tournament/referee/list.component';
import { TournamentRoleRepository } from './tournament/role/repository';
import { RoundsSettingsComponent } from './tournament/settings/rounds.component';
import { TournamentStructureComponent } from './tournament/structure/main.component';
import { TournamentStructureRoundComponent } from './tournament/structure/round.component';
import { TournamentViewTvComponent } from './tournament/view/tv.component';
import { TournamentViewComponent } from './tournament/view/view.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FctoernooiRoutingModule,
    NgbModule,
    NouisliderModule,
    ReactiveFormsModule
  ],
  declarations: [
    TournamentNewComponent,
    TournamentEditComponent,
    TournamentHomeComponent,
    TournamentStructureComponent,
    TournamentStructureRoundComponent,
    GameListComponent,
    TournamentPlanningViewComponent,
    CompetitorListComponent,
    RefereeListComponent,
    TournamentCompetitorEditComponent,
    RoundsSettingsComponent,
    FieldListComponent,
    TournamentViewComponent,
    TournamentViewTvComponent,
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
    GameScoreRepository,
    IconManager
  ]
})
export class FctoernooiModule { }

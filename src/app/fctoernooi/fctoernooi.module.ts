import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCheckSquare, faSquare } from '@fortawesome/free-regular-svg-icons';
import {
  faArrowsAltH,
  faArrowsAltV,
  faCheckCircle,
  faCircle,
  faCogs,
  faCompress,
  faExpand,
  faListUl,
  faMinus,
  faMoneyBillAlt,
  faPrint,
  faRandom,
  faSort,
  faTimesCircle,
  faTrashAlt,
  faUserTag,
} from '@fortawesome/free-solid-svg-icons';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap/alert/alert.module';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap/collapse/collapse.module';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap/datepicker/datepicker.module';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap/popover/popover.module';
import { NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap/timepicker/timepicker.module';
import { NouisliderModule } from 'ng2-nouislider';
import { ScrollToModule } from 'ng2-scroll-to-el';
import {
  GameRepository,
  GameScoreRepository,
  PlanningRepository,
  PoulePlaceRepository,
  PouleRepository,
  QualifyRuleRepository,
  RoundConfigRepository,
  RoundConfigScoreRepository,
  RoundRepository,
  StructureRepository,
  TeamRepository,
} from 'ngx-sport';

import { EscapeHtmlPipe } from '../common/escapehtmlpipe';
import { IconManager } from '../common/iconmanager';
import { FctoernooiRoutingModule } from './fctoernooi-routing.module';
import { TournamentCompetitorEditComponent } from './tournament/competitor/edit.component';
import { CompetitorListComponent } from './tournament/competitor/list.component';
import { TournamentEditComponent } from './tournament/edit/edit.component';
import { FieldListComponent } from './tournament/field/list.component';
import { TournamentFilterComponent } from './tournament/filter/filter.component';
import { TournamentGameEditComponent } from './tournament/game/edit.component';
import { GameListComponent } from './tournament/game/list.component';
import { TournamentHomeComponent } from './tournament/home/home.component';
import { TournamentNewComponent } from './tournament/new/new.component';
import { TournamentPlanningViewComponent } from './tournament/planning/view/component';
import { TournamentRefereeEditComponent } from './tournament/referee/edit.component';
import { RefereeListComponent } from './tournament/referee/list.component';
import { TournamentRoleRepository } from './tournament/role/repository';
import { RoundsSettingsComponent } from './tournament/settings/rounds.component';
import { TournamentSponsorEditComponent } from './tournament/sponsor/edit.component';
import { SponsorListComponent } from './tournament/sponsor/list.component';
import { TournamentStructureComponent } from './tournament/structure/main.component';
import { TournamentStructureRoundComponent } from './tournament/structure/round.component';
import { TournamentViewTvComponent } from './tournament/view/tv.component';
import { TournamentViewComponent } from './tournament/view/view.component';

library.add(
  faMoneyBillAlt, faTrashAlt, faCircle, faCheckCircle, faTimesCircle, faListUl, faCogs, faMinus,
  faExpand, faCompress, faPrint, faSort, faRandom, faSquare, faCheckSquare, faArrowsAltH,
  faArrowsAltV, faUserTag
);

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FctoernooiRoutingModule,
    NgbDatepickerModule, NgbTimepickerModule, NgbAlertModule, NgbPopoverModule, NgbCollapseModule,
    NouisliderModule,
    ReactiveFormsModule,
    ScrollToModule.forRoot(),
    FontAwesomeModule
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
    SponsorListComponent,
    TournamentCompetitorEditComponent,
    RoundsSettingsComponent,
    FieldListComponent,
    TournamentViewComponent,
    TournamentViewTvComponent,
    TournamentGameEditComponent,
    TournamentRefereeEditComponent,
    TournamentSponsorEditComponent,
    TournamentFilterComponent,
    EscapeHtmlPipe
  ],
  providers: [
    TournamentRoleRepository,
    StructureRepository,
    RoundRepository,
    RoundConfigRepository,
    RoundConfigScoreRepository,
    PouleRepository,
    PoulePlaceRepository,
    QualifyRuleRepository,
    TeamRepository,
    GameRepository,
    GameScoreRepository,
    PlanningRepository,
    IconManager,
  ]
})
export class FctoernooiModule { }

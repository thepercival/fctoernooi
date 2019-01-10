import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faProductHunt } from '@fortawesome/free-brands-svg-icons';
import { faCheckSquare, faSquare } from '@fortawesome/free-regular-svg-icons';
import {
  faArrowsAltH,
  faCheckCircle,
  faCircle,
  faCogs,
  faCompress,
  faCopy,
  faExpand,
  faInfoCircle,
  faLink,
  faListUl,
  faMedal,
  faMinus,
  faMoneyBillAlt,
  faPrint,
  faQrcode,
  faRandom,
  faSort,
  faTimesCircle,
  faTrashAlt,
  faUsers,
  faUserTag,
} from '@fortawesome/free-solid-svg-icons';
import {
  NgbAlertModule,
  NgbCollapseModule,
  NgbDatepickerModule,
  NgbModalModule,
  NgbPopoverModule,
  NgbTimepickerModule,
} from '@ng-bootstrap/ng-bootstrap';
import { NouisliderModule } from 'ng2-nouislider';
import {
  GameMapper,
  GameRepository,
  GameScoreMapper,
  PlanningRepository,
  PouleMapper,
  PoulePlaceMapper,
  PoulePlaceRepository,
  QualifyRuleRepository,
  RoundMapper,
  RoundNumberConfigMapper,
  RoundNumberConfigRepository,
  RoundNumberConfigScoreMapper,
  RoundNumberMapper,
  RoundRepository,
  StructureMapper,
  StructureRepository,
  TeamMapper,
  TeamRepository,
} from 'ngx-sport';

import { EscapeHtmlPipe } from '../common/escapehtmlpipe';
import { IconManager } from '../common/iconmanager';
import { RoleMapper } from '../lib/role/mapper';
import { FctoernooiRoutingModule } from './fctoernooi-routing.module';
import { TournamentCompetitorEditComponent } from './tournament/competitor/edit.component';
import { CompetitorListComponent } from './tournament/competitor/list.component';
import { CompetitorListLineComponent } from './tournament/competitor/listline.component';
import { TournamentListRemoveModalComponent } from './tournament/competitor/listremovemodal.component';
import { TournamentEditComponent } from './tournament/edit/edit.component';
import { FieldListComponent } from './tournament/field/list.component';
import { TournamentFilterComponent } from './tournament/filter/filter.component';
import { TournamentGameEditComponent } from './tournament/game/edit.component';
import { GameListComponent } from './tournament/game/list.component';
import { TournamentHomeComponent } from './tournament/home/home.component';
import { ProgressComponent } from './tournament/home/progress.component';
import { TournamentNewComponent } from './tournament/new/new.component';
import { TournamentPlanningViewComponent } from './tournament/planning/view/component';
import { TournamentEndRankingViewComponent } from './tournament/ranking/end/component';
import { TournamentRefereeEditComponent } from './tournament/referee/edit.component';
import { RefereeListComponent } from './tournament/referee/list.component';
import { RoundsSettingsComponent } from './tournament/settings/rounds.component';
import { TournamentSponsorEditComponent } from './tournament/sponsor/edit.component';
import { SponsorListComponent } from './tournament/sponsor/list.component';
import { TournamentStructureHelpModalComponent } from './tournament/structure/helpmodal.component';
import { TournamentStructureComponent } from './tournament/structure/main.component';
import { TournamentStructureRoundComponent } from './tournament/structure/round.component';
import { TournamentStructureViewComponent } from './tournament/structure/view.component';
import { TournamentViewTvComponent } from './tournament/view/tv.component';
import { TournamentViewComponent } from './tournament/view/view.component';

library.add(
  faMoneyBillAlt, faTrashAlt, faCircle, faCheckCircle, faTimesCircle, faListUl, faCogs, faMinus,
  faExpand, faCompress, faPrint, faSort, faRandom, faSquare, faCheckSquare, faArrowsAltH,
  faUserTag, faInfoCircle, faMedal, faProductHunt, faLink, faUsers, faQrcode, faCopy
);

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FctoernooiRoutingModule,
    NgbDatepickerModule, NgbTimepickerModule, NgbAlertModule, NgbPopoverModule, NgbCollapseModule, NgbModalModule.forRoot(),
    NouisliderModule,
    ReactiveFormsModule,
    FontAwesomeModule
  ],
  declarations: [
    TournamentNewComponent,
    TournamentEditComponent,
    TournamentHomeComponent,
    TournamentStructureComponent,
    TournamentStructureViewComponent,
    TournamentStructureRoundComponent,
    GameListComponent,
    TournamentPlanningViewComponent,
    TournamentEndRankingViewComponent,
    CompetitorListComponent,
    CompetitorListLineComponent,
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
    TournamentStructureHelpModalComponent,
    TournamentListRemoveModalComponent,
    ProgressComponent,
    EscapeHtmlPipe
  ],
  entryComponents: [TournamentStructureHelpModalComponent, TournamentListRemoveModalComponent],
  providers: [
    RoleMapper,
    StructureRepository,
    StructureMapper,
    RoundRepository,
    RoundMapper,
    PouleMapper,
    PoulePlaceMapper,
    GameMapper,
    GameScoreMapper,
    RoundNumberConfigRepository,
    RoundNumberMapper,
    RoundNumberConfigMapper,
    RoundNumberConfigScoreMapper,
    PoulePlaceRepository,
    QualifyRuleRepository,
    TeamRepository,
    TeamMapper,
    GameRepository,
    PlanningRepository,
    IconManager,
  ]
})
export class FctoernooiModule { }

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faProductHunt } from '@fortawesome/free-brands-svg-icons';
import { faCheckSquare, faSquare } from '@fortawesome/free-regular-svg-icons';
import {
    faCheckCircle,
    faCircle,
    faCogs,
    faCopy,
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
    faUnlink,
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
import {
    CompetitorMapper,
    CompetitorRepository,
    GameMapper,
    GamePoulePlaceMapper,
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
} from 'ngx-sport';

import { EscapeHtmlPipe } from '../common/escapehtmlpipe';
import { IconManager } from '../common/iconmanager';
import { RoleMapper } from '../lib/role/mapper';
import { TournamentCompetitorEditComponent } from './competitor/edit.component';
import { CompetitorListComponent } from './competitor/list.component';
import { CompetitorListLineComponent } from './competitor/listline.component';
import { TournamentListRemoveModalComponent } from './competitor/listremovemodal.component';
import { TournamentEditComponent } from './edit/edit.component';
import { FieldListComponent } from './field/list.component';
import { TournamentFilterComponent } from './filter/filter.component';
import { TournamentGameEditComponent } from './game/edit.component';
import { GameListComponent } from './game/list.component';
import { TournamentHomeComponent } from './home/home.component';
import { ProgressComponent } from './home/progress.component';
import { TournamentLiveboardGamesComponent } from './liveboard/games.liveboard.component';
import { TournamentLiveboardComponent } from './liveboard/liveboard.component';
import { TournamentLiveboardPoulesComponent } from './liveboard/poules.liveboard.component';
import { TournamentLiveboardSponsorsComponent } from './liveboard/sponsors.liveboard.component';
import { TournamentNewComponent } from './new/new.component';
import { TournamentEndRankingViewComponent } from './ranking/end.component';
import { TournamentPouleRankingComponent } from './ranking/poule.component';
import { TournamentRefereeEditComponent } from './referee/edit.component';
import { RefereeListComponent } from './referee/list.component';
import { TournamentRoundNumberViewComponent } from './roundnumber/rnview.component';
import { RoundsSettingsComponent } from './settings/rounds.component';
import { TournamentSponsorEditComponent } from './sponsor/edit.component';
import { SponsorListComponent } from './sponsor/list.component';
import { TournamentStructureComponent } from './structure/main.component';
import { TournamentStructureQualificationModalComponent } from './structure/qualificationmodal.component';
import { TournamentStructureRoundComponent } from './structure/round.component';
import { TournamentStructureViewComponent } from './structure/view.component';
import { TournamentRoutingModule } from './tournament-routing.module';
import { TournamentViewComponent } from './view/view.component';

library.add(
  faMoneyBillAlt, faTrashAlt, faCircle, faCheckCircle, faTimesCircle, faListUl, faCogs, faMinus,
  faUnlink, faPrint, faSort, faRandom, faSquare, faCheckSquare, faUserTag, faInfoCircle, faMedal, faProductHunt, faLink, faUsers, faQrcode, faCopy
);

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TournamentRoutingModule,
    NgbDatepickerModule, NgbTimepickerModule, NgbAlertModule, NgbPopoverModule, NgbCollapseModule, NgbModalModule,
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
    TournamentRoundNumberViewComponent,
    TournamentEndRankingViewComponent,
    TournamentPouleRankingComponent,
    CompetitorListComponent,
    CompetitorListLineComponent,
    RefereeListComponent,
    SponsorListComponent,
    TournamentCompetitorEditComponent,
    RoundsSettingsComponent,
    FieldListComponent,
    TournamentViewComponent,
    TournamentLiveboardComponent,
    TournamentLiveboardPoulesComponent,
    TournamentLiveboardSponsorsComponent,
    TournamentLiveboardGamesComponent,
    TournamentGameEditComponent,
    TournamentRefereeEditComponent,
    TournamentSponsorEditComponent,
    TournamentFilterComponent,
    TournamentStructureQualificationModalComponent,
    TournamentListRemoveModalComponent,
    ProgressComponent,
    EscapeHtmlPipe
  ],
  entryComponents: [TournamentStructureQualificationModalComponent, TournamentListRemoveModalComponent],
  providers: [
    RoleMapper,
    StructureRepository,
    StructureMapper,
    RoundRepository,
    RoundMapper,
    PouleMapper,
    PoulePlaceMapper,
    GameMapper,
    GamePoulePlaceMapper,
    GameScoreMapper,
    RoundNumberConfigRepository,
    RoundNumberMapper,
    RoundNumberConfigMapper,
    RoundNumberConfigScoreMapper,
    PoulePlaceRepository,
    QualifyRuleRepository,
    CompetitorRepository,
    CompetitorMapper,
    GameRepository,
    PlanningRepository,
    IconManager,
  ]
})
export class TournamentModule { }

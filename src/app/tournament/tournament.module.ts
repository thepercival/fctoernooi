import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faProductHunt } from '@fortawesome/free-brands-svg-icons';
import { faCheckSquare, faSquare } from '@fortawesome/free-regular-svg-icons';
import {
  faCheckCircle,
  faCircle,
  faCogs,
  faCopy,
  faDotCircle,
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
  faTh,
  faTimesCircle,
  faTrashAlt,
  faUnlink,
  faUsers,
  faUserTag,
} from '@fortawesome/free-solid-svg-icons';
import {
  NgbAlertModule,
  NgbButtonsModule,
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
  GamePlaceMapper,
  GameRepository,
  GameScoreMapper,
  PlaceMapper,
  PlaceRepository,
  PlanningRepository,
  PouleMapper,
  RoundMapper,
  RoundNumberMapper,
  RoundRepository,
  SportConfigMapper,
  SportConfigRepository,
  SportConfigService,
  SportPlanningConfigMapper,
  SportPlanningConfigService,
  SportRepository,
  SportScoreConfigMapper,
  SportScoreConfigService,
  StructureMapper,
  StructureRepository,
} from 'ngx-sport';

import { CSSService } from '../common/cssservice';
import { EscapeHtmlPipe } from '../common/escapehtmlpipe';
import { RoleMapper } from '../lib/role/mapper';
import { CommonSharedModule } from './../common/shared.module';
import { CompetitorEditComponent } from './competitor/edit.component';
import { CompetitorListComponent } from './competitor/list.component';
import { CompetitorListLineComponent } from './competitor/listline.component';
import { CompetitorListRemoveModalComponent } from './competitor/listremovemodal.component';
import { EditComponent } from './edit/edit.component';
import { FieldListComponent } from './field/list.component';
import { FilterComponent } from './filter/filter.component';
import { GameEditComponent } from './game/edit.component';
import { GameListComponent } from './game/list.component';
import { HomeComponent } from './home/home.component';
import { ProgressComponent } from './home/progress.component';
import { LiveboardGamesComponent } from './liveboard/games.liveboard.component';
import { LiveboardComponent } from './liveboard/liveboard.component';
import { LiveboardPoulesComponent } from './liveboard/poules.liveboard.component';
import { LiveboardSponsorsComponent } from './liveboard/sponsors.liveboard.component';
import { NewComponent } from './new/new.component';
import { EndRankingViewComponent } from './ranking/end.component';
import { PouleRankingComponent } from './ranking/poule.component';
import { RefereeEditComponent } from './referee/edit.component';
import { RefereeListComponent } from './referee/list.component';
import { TournamentRoundNumberViewComponent } from './roundnumber/rnview.component';
import { RoundsSettingsComponent } from './settings/rounds.component';
import { SponsorEditComponent } from './sponsor/edit.component';
import { SponsorListComponent } from './sponsor/list.component';
import { SportSelectComponent } from './sport/select.component';
import { SportConfigEditComponent } from './sportconfig/edit.component';
import { SportConfigListComponent } from './sportconfig/list.component';
import { StructureComponent } from './structure/main.component';
import { StructureQualifyComponent } from './structure/qualify.component';
import { StructureRoundComponent } from './structure/round.component';
import { StructureRoundArrangeComponent } from './structure/round/arrange.component';
import { StructureViewComponent } from './structure/view.component';
import { TitleComponent } from './title/title.component';
import { RoutingModule } from './tournament-routing.module';
import { ViewComponent } from './view/view.component';


library.add(
  faMoneyBillAlt, faTrashAlt, faCircle, faCheckCircle, faTimesCircle, faListUl, faCogs, faMinus, faTh,
  faUnlink, faPrint, faSort, faRandom, faSquare, faCheckSquare, faUserTag, faInfoCircle, faMedal,
  faProductHunt, faLink, faUsers, faQrcode, faCopy, faDotCircle
);

@NgModule({
  imports: [
    CommonModule,
    RoutingModule,
    NgbDatepickerModule, NgbTimepickerModule, NgbAlertModule, NgbPopoverModule, NgbCollapseModule, NgbModalModule, NgbButtonsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    CommonSharedModule
  ],
  declarations: [
    NewComponent,
    EditComponent,
    HomeComponent,
    TitleComponent,
    StructureComponent,
    StructureViewComponent,
    StructureRoundComponent,
    StructureRoundArrangeComponent,
    StructureQualifyComponent,
    GameListComponent,
    TournamentRoundNumberViewComponent,
    EndRankingViewComponent,
    PouleRankingComponent,
    CompetitorListComponent,
    CompetitorListLineComponent,
    RefereeListComponent,
    SportConfigListComponent,
    SportConfigEditComponent,
    SportSelectComponent,
    SponsorListComponent,
    CompetitorEditComponent,
    RoundsSettingsComponent,
    FieldListComponent,
    ViewComponent,
    LiveboardComponent,
    LiveboardPoulesComponent,
    LiveboardSponsorsComponent,
    LiveboardGamesComponent,
    GameEditComponent,
    RefereeEditComponent,
    SponsorEditComponent,
    FilterComponent,
    CompetitorListRemoveModalComponent,
    ProgressComponent,
    EscapeHtmlPipe
  ],
  entryComponents: [CompetitorListRemoveModalComponent],
  providers: [
    RoleMapper,
    StructureRepository,
    StructureMapper,
    RoundRepository,
    RoundMapper,
    PouleMapper,
    PlaceMapper,
    GameMapper,
    GamePlaceMapper,
    GameScoreMapper,
    SportConfigRepository,
    SportRepository,
    RoundNumberMapper,
    SportConfigMapper,
    SportScoreConfigService,
    SportPlanningConfigService,
    SportConfigService,
    SportScoreConfigMapper,
    PlaceRepository,
    CompetitorRepository,
    CompetitorMapper,
    GameRepository,
    PlanningRepository,
    CSSService,
    SportPlanningConfigMapper
  ]
})
export class TournamentModule { }

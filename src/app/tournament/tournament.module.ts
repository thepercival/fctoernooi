import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faProductHunt } from '@fortawesome/free-brands-svg-icons';
import { faCheckSquare, faSquare } from '@fortawesome/free-regular-svg-icons';
import {
  faCheckCircle,
  faCircle,
  faCogs,
  faCopy,
  faDotCircle,
  faInfoCircle,
  faListUl,
  faMedal,
  faMinus,
  faMoneyBillAlt,
  faFileExcel,
  faFileExport,
  faPrint,
  faQrcode,
  faRandom,
  faSort,
  faSync,
  faTh,
  faTimesCircle,
  faTrashAlt,
  faCompressAlt,
  faExpandAlt,
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
  NgbNavModule,
  NgbModalConfig,
} from '@ng-bootstrap/ng-bootstrap';
import { ClipboardModule } from 'ngx-clipboard';
import {
  CompetitionMapper,
  CompetitorMapper,
  GameMapper,
  GamePlaceMapper,
  GameScoreMapper,
  PlaceMapper,
  PlanningMapper,
  PouleMapper,
  RoundMapper,
  RoundNumberMapper,
  SportConfigMapper,
  SportConfigService,
  PlanningConfigService,
  SportScoreConfigMapper,
  SportScoreConfigService,
  SportService,
  StructureMapper,
  SportMapper,
  SeasonMapper,
  RefereeMapper,
  PlanningConfigMapper,
  LeagueMapper,
  FieldMapper,
  AssociationMapper,
  NameService,
} from 'ngx-sport';

import { CSSService } from '../common/cssservice';
import { EscapeHtmlPipe } from '../common/escapehtmlpipe';
import { RoleMapper } from '../lib/role/mapper';
import { CommonSharedModule } from './../common/shared.module';
import { CompetitorEditComponent } from './competitor/edit.component';
import { CompetitorListComponent } from './competitor/list.component';
import { CompetitorListLineComponent } from './competitor/listline.component';
import { CompetitorListRemoveModalComponent } from './competitor/listremovemodal.component';
import { FieldEditComponent } from './field/edit.component';
import { FieldListComponent } from './field/list.component';
import { FilterComponent } from './filter/filter.component';
import { GameEditComponent } from './game/edit.component';
import { HomeComponent } from './home/home.component';
import { ProgressComponent } from './home/progress.component';
import { LiveboardGamesComponent } from './liveboard/games.liveboard.component';
import { LiveboardComponent } from './liveboard/liveboard.component';
import { LiveboardPoulesComponent } from './liveboard/poules.liveboard.component';
import { LiveboardSponsorsComponent } from './liveboard/sponsors.liveboard.component';
import { NewComponent } from './new/new.component';
import { PlanningEditComponent } from './planning/edit.component';
import { GameListComponent } from './planning/gamelist.component';
import { PlanningConfigComponent } from './planningconfig/edit.component';
import { EndRankingViewComponent } from './ranking/end.component';
import { PouleRankingComponent } from './ranking/poule.component';
import { RefereeEditComponent } from './referee/edit.component';
import { RefereeListComponent } from './referee/list.component';
import { TournamentRoundNumberViewComponent } from './roundnumber/rnview.component';
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
import { SportScoreEditComponent } from './sportscore/edit.component';
import { ModalRoundNumbersComponent } from './roundnumber/selector.component';
import { StructureRepository } from '../lib/ngx-sport/structure/repository';
import { SportRepository } from '../lib/ngx-sport/sport/repository';
import { SportConfigRepository } from '../lib/ngx-sport/sport/config/repository';
import { SportScoreConfigRepository } from '../lib/ngx-sport/sport/scoreconfig/repository';
import { CompetitorRepository } from '../lib/ngx-sport/competitor/repository';
import { PlaceRepository } from '../lib/ngx-sport/place/repository';
import { GameRepository } from '../lib/ngx-sport/game/repository';
import { PlanningRepository } from '../lib/ngx-sport/planning/repository';
import { PlanningConfigRepository } from '../lib/ngx-sport/planning/config/repository';
import { PouleRankingModalComponent } from './poule/rankingmodal.component';
import { RefereeRepository } from '../lib/ngx-sport/referee/repository';
import { FieldRepository } from '../lib/ngx-sport/field/repository';
import { TournamentRepository } from '../lib/tournament/repository';
import { TournamentMapper } from '../lib/tournament/mapper';
import { SponsorMapper } from '../lib/sponsor/mapper';
import { SponsorRepository } from '../lib/sponsor/repository';

@NgModule({
  imports: [
    ClipboardModule,
    CommonModule,
    RoutingModule,
    NgbDatepickerModule, NgbTimepickerModule, NgbAlertModule, NgbPopoverModule, NgbCollapseModule, NgbModalModule, NgbButtonsModule,
    NgbNavModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    CommonSharedModule
  ],
  declarations: [
    NewComponent,
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
    SportScoreEditComponent,
    SportSelectComponent,
    SponsorListComponent,
    CompetitorEditComponent,
    PlanningConfigComponent,
    FieldListComponent,
    FieldEditComponent,
    ViewComponent,
    LiveboardComponent,
    LiveboardPoulesComponent,
    LiveboardSponsorsComponent,
    LiveboardGamesComponent,
    GameEditComponent,
    RefereeEditComponent,
    SponsorEditComponent,
    PlanningEditComponent,
    FilterComponent,
    ModalRoundNumbersComponent,
    CompetitorListRemoveModalComponent,
    PouleRankingModalComponent,
    ProgressComponent,
    EscapeHtmlPipe
  ],
  entryComponents: [ModalRoundNumbersComponent, CompetitorListRemoveModalComponent, PouleRankingModalComponent],
  providers: [
    AssociationMapper,
    CompetitionMapper,
    CompetitorRepository,
    CompetitorMapper,
    CSSService,
    FieldMapper,
    FieldRepository,
    GameRepository,
    GameMapper,
    GamePlaceMapper,
    GameScoreMapper,
    LeagueMapper,
    NameService,
    NgbModalConfig,
    PlaceMapper,
    PlaceRepository,
    PlanningConfigService,
    PlanningRepository,
    PlanningMapper,
    PlanningConfigMapper,
    PlanningConfigRepository,
    PouleMapper,
    RefereeMapper,
    RefereeRepository,
    RoleMapper,
    RoundMapper,
    RoundNumberMapper,
    SeasonMapper,
    SponsorMapper,
    SponsorRepository,
    SportMapper,
    SportConfigRepository,
    SportRepository,
    SportConfigMapper,
    SportScoreConfigService,
    SportService,
    SportConfigService,
    SportScoreConfigMapper,
    SportScoreConfigRepository,
    StructureRepository,
    StructureMapper,
    TournamentRepository,
    TournamentMapper,
  ]
})
export class TournamentModule {
  constructor(library: FaIconLibrary, modalConfig: NgbModalConfig, ) {
    library.addIcons(
      faMoneyBillAlt, faTrashAlt, faCircle, faCheckCircle, faTimesCircle, faListUl, faCogs, faMinus, faTh,
      faCompressAlt, faExpandAlt, faFileExport, faFileExcel, faPrint, faSort, faRandom, faSquare, faCheckSquare,
      faUserTag, faInfoCircle, faMedal, faUsers, faQrcode, faCopy, faDotCircle, faSync
    );
    library.addIcons(
      faProductHunt
    );
    modalConfig.centered = true;
    modalConfig.scrollable = true;
    modalConfig.size = 'lg';
  }
}



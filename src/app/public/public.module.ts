import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  faListOl,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import {
  NgbAlertModule,
  NgbButtonsModule,
  NgbCollapseModule,
  NgbModalModule,
  NgbPopoverModule,
  NgbTimepickerModule,
  NgbNavModule,
  NgbModalConfig,
} from '@ng-bootstrap/ng-bootstrap';
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

import { CSSService } from '../shared/common/cssservice';
import { RoleMapper } from '../lib/role/mapper';
import { CommonSharedModule } from '../shared/common/shared.module';
import { FilterComponent } from './filter/filter.component';
import { HomeComponent } from './home/home.component';
import { ProgressComponent } from './liveboard/progress.component';
import { LiveboardGamesComponent } from './liveboard/games.liveboard.component';
import { LiveboardComponent } from './liveboard/liveboard.component';
import { LiveboardPoulesComponent } from './liveboard/poules.liveboard.component';
import { LiveboardSponsorsComponent } from './liveboard/sponsors.liveboard.component';
import { PreNewComponent } from './prenew/prenew.component';
import { StructureViewComponent } from './structure/view.component';
import { RoutingModule } from './public-routing.module';
import { GamesComponent } from './games/view.component';
import { StructureRepository } from '../lib/ngx-sport/structure/repository';
import { TournamentRepository } from '../lib/tournament/repository';
import { TournamentModule } from '../shared/tournament/tournament.module';
import { TournamentMapper } from '../lib/tournament/mapper';
import { SponsorMapper } from '../lib/sponsor/mapper';
import { RankingComponent } from './ranking/view.component';
import { PlanningRepository } from '../lib/ngx-sport/planning/repository';
import { RankingRoundNumberComponent } from './ranking/roundnumber.component';

@NgModule({
  imports: [
    // ClipboardModule,
    CommonModule,
    RoutingModule,
    NgbTimepickerModule, NgbAlertModule, NgbPopoverModule, NgbCollapseModule, NgbModalModule, NgbButtonsModule,
    NgbNavModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    CommonSharedModule, TournamentModule
  ],
  declarations: [
    PreNewComponent,
    HomeComponent,
    StructureViewComponent,
    GamesComponent,
    LiveboardComponent,
    LiveboardPoulesComponent,
    LiveboardSponsorsComponent,
    LiveboardGamesComponent,
    FilterComponent,
    ProgressComponent,
    RankingComponent,
    RankingRoundNumberComponent
  ], /*
  entryComponents: [PouleRankingModalComponent],*/
  providers: [
    AssociationMapper,
    CompetitionMapper,
    CompetitorMapper,
    CSSService,
    FieldMapper,
    GameMapper,
    GamePlaceMapper,
    GameScoreMapper,
    LeagueMapper,
    NameService,
    NgbModalConfig,
    PlaceMapper,
    PlanningRepository,
    PlanningConfigService,
    PlanningMapper,
    PlanningConfigMapper,
    PouleMapper,
    RefereeMapper,
    RoleMapper,
    RoundMapper,
    RoundNumberMapper,
    SeasonMapper,
    SponsorMapper,
    SportMapper,
    SportConfigMapper,
    SportScoreConfigService,
    SportService,
    SportConfigService,
    SportScoreConfigMapper,
    StructureRepository,
    StructureMapper,
    TournamentRepository,
    TournamentMapper
  ]
})
export class PublicModule {
  constructor(library: FaIconLibrary, modalConfig: NgbModalConfig, ) {
    library.addIcons(
      faListOl, faChevronRight
      /*faMoneyBillAlt, faTrashAlt, faCircle, faTimesCircle, faListUl, faCogs, faMinus, faTh,
      faCompressAlt, faExpandAlt, faFileExport, faFileExcel, faPrint, faSort, faRandom, faSquare, faCheckSquare,
      faInfoCircle, faMedal, faUsers, faQrcode, faCopy, faDotCircle, faSync*/
    );
    /*library.addIcons(
      faProductHunt
    );*/
    modalConfig.centered = true;
    modalConfig.scrollable = true;
    modalConfig.size = 'lg';
  }
}



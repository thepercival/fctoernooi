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
import { TitleComponent } from '../shared/tournament/title/title.component';
import { RoutingModule } from './public-routing.module';
import { PlanningComponent } from './planning/view.component';
import { StructureRepository } from '../lib/ngx-sport/structure/repository';
import { TournamentRepository } from '../lib/tournament/repository';
import { TournamentModule } from '../shared/tournament/tournament.module';

@NgModule({
  imports: [
    ClipboardModule,
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
    PlanningComponent,
    LiveboardComponent,
    LiveboardPoulesComponent,
    LiveboardSponsorsComponent,
    LiveboardGamesComponent,
    FilterComponent,
    ProgressComponent
  ],/*
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
    PlanningConfigService,
    PlanningMapper,
    PlanningConfigMapper,
    PouleMapper,
    RefereeMapper,
    RoleMapper,
    RoundMapper,
    RoundNumberMapper,
    SeasonMapper,
    SportMapper,
    SportConfigMapper,
    SportScoreConfigService,
    SportService,
    SportConfigService,
    SportScoreConfigMapper,
    StructureRepository,
    StructureMapper,
    TournamentRepository
  ]
})
export class PublicModule {
  constructor(library: FaIconLibrary, modalConfig: NgbModalConfig, ) {
    library.addIcons(
      /*faMoneyBillAlt, faTrashAlt, faCircle, faCheckCircle, faTimesCircle, faListUl, faCogs, faMinus, faTh,
      faCompressAlt, faExpandAlt, faFileExport, faFileExcel, faPrint, faSort, faRandom, faSquare, faCheckSquare,
      faUserTag, faInfoCircle, faMedal, faUsers, faQrcode, faCopy, faDotCircle, faSync*/
    );
    /*library.addIcons(
      faProductHunt
    );*/
    modalConfig.centered = true;
    modalConfig.scrollable = true;
    modalConfig.size = 'lg';
  }
}



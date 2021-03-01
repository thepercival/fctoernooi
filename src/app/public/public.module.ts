import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  faListOl,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import {
  ScoreConfigService,
  CompetitionSportService,
  QualifyAgainstConfigService,
  GameAmountConfigService
} from 'ngx-sport';

import { CSSService } from '../shared/common/cssservice';
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
import { TournamentModule } from '../shared/tournament/tournament.module';
import { RankingComponent } from './ranking/view.component';
import { RankingRoundComponent } from './ranking/round.component';
@NgModule({
  imports: [
    CommonModule,
    RoutingModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    CommonSharedModule,
    TournamentModule
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
    RankingRoundComponent
  ],
  providers: [
    CompetitionSportService,
    CSSService,
    GameAmountConfigService,
    QualifyAgainstConfigService,
    ScoreConfigService
  ]
})
export class PublicModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(
      faListOl, faChevronRight
      /*faMoneyBillAlt, faTrashAlt, faCircle, faTimesCircle, faListUl, faCogs, faMinus, faTh,
      faCompressAlt, faExpandAlt, faFileExport, faFileExcel, faPrint, faSort, faRandom,
      faInfoCircle, faMedal, faUsers, faQrcode, faCopy, faDotCircle, faSync*/
    );
    /*library.addIcons(
      faProductHunt
    );*/
  }
}

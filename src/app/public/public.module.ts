import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  faListOl,
  faEyeSlash,
  faSearch,
  faAngleDoubleDown,
  faUsers,
  faCopy,
} from '@fortawesome/free-solid-svg-icons';
import {
  ScoreConfigService,
  CompetitionSportEditor,
  AgainstQualifyConfigService,
  GameAmountConfigService
} from 'ngx-sport';

import { CSSService } from '../shared/common/cssservice';
import { CommonSharedModule } from '../shared/common/shared.module';
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
import { RankingViewComponent } from './ranking/view.component';
import { ScreenConfigsModalComponent } from './liveboard/screenconfigsmodal.component';
import { SelectFavoritesComponent } from './favorites/select.component';
import { FavoritesCategoryComponent } from './favorites/category.component';
import { PublicShellsComponent } from './shells/shells.component';
import { ExamplesComponent } from './examples/examples.component';
import { RegistrationComponent } from './registration-form/registration-form.component';
import { CopyModalComponent } from './tournament/copymodal.component';

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
    CopyModalComponent,
    ExamplesComponent,
    FavoritesCategoryComponent,
    GamesComponent,
    LiveboardComponent,
    LiveboardPoulesComponent,
    LiveboardSponsorsComponent,
    LiveboardGamesComponent,
    PreNewComponent,
    StructureViewComponent, 
    SelectFavoritesComponent,
    ProgressComponent,
    PublicShellsComponent,
    RankingViewComponent,
    RegistrationComponent,
    ScreenConfigsModalComponent
  ],
  providers: [
    CompetitionSportEditor,
    CSSService,
    GameAmountConfigService,
    AgainstQualifyConfigService,
    ScoreConfigService
  ]
})
export class PublicModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(
      faListOl, faSearch, faEyeSlash, faAngleDoubleDown, faUsers, faCopy
      /*faMoneyBillAlt, faTrashAlt, faCircle, faTimesCircle, faListUl, faCogs, faMinus, faTh,
      faCompressAlt, faExpandAlt, faFileExport, faFileExcel, faPrint, faSort, faRandom,
      faInfoCircle, faMedal, faQrcode, faCopy, faDotCircle, faSync*/
    );
    /*library.addIcons(
      faProductHunt
    );*/
  }
}

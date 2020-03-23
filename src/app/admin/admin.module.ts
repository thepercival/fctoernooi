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
  faShareAlt,
  faEye,
  faBasketballBall,
  faGamepad,
  faChess,
  faTableTennis,
  faBaseballBall,
  faHockeyPuck,
  faVolleyballBall,
  faClipboardCheck,
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
import { CompetitorEditComponent } from './competitor/edit.component';
import { CompetitorListComponent } from './competitor/list.component';
import { CompetitorListLineComponent } from './competitor/listline.component';
import { CompetitorListRemoveModalComponent } from './competitor/listremovemodal.component';
import { FieldEditComponent } from './field/edit.component';
import { FieldListComponent } from './field/list.component';
import { GameEditComponent } from './game/edit.component';
import { HomeComponent } from './home/home.component';
import { NewComponent } from './new/new.component';
import { StartBreakComponent } from './startbreak/startbreak.component';
import { GameListComponent } from './game/list.component';
import { PlanningConfigComponent } from './planningconfig/edit.component';
import { RefereeEditComponent } from './referee/edit.component';
import { RefereeListComponent } from './referee/list.component';
import { SponsorEditComponent } from './sponsor/edit.component';
import { SponsorListComponent } from './sponsor/list.component';
import { SportSelectComponent } from './sport/select.component';
import { SportConfigEditComponent } from './sportconfig/edit.component';
import { SportConfigListComponent } from './sportconfig/list.component';
import { StructureEditComponent } from './structure/edit.component';
import { RoutingModule } from './admin-routing.module';
import { SportScoreEditComponent } from './sportscore/edit.component';
import { StructureRepository } from '../lib/ngx-sport/structure/repository';
import { SportRepository } from '../lib/ngx-sport/sport/repository';
import { SportConfigRepository } from '../lib/ngx-sport/sport/config/repository';
import { SportScoreConfigRepository } from '../lib/ngx-sport/sport/scoreconfig/repository';
import { CompetitorRepository } from '../lib/ngx-sport/competitor/repository';
import { PlaceRepository } from '../lib/ngx-sport/place/repository';
import { GameRepository } from '../lib/ngx-sport/game/repository';
import { PlanningRepository } from '../lib/ngx-sport/planning/repository';
import { PlanningConfigRepository } from '../lib/ngx-sport/planning/config/repository';
import { RefereeRepository } from '../lib/ngx-sport/referee/repository';
import { FieldRepository } from '../lib/ngx-sport/field/repository';
import { TournamentRepository } from '../lib/tournament/repository';
import { TournamentMapper } from '../lib/tournament/mapper';
import { SponsorMapper } from '../lib/sponsor/mapper';
import { SponsorRepository } from '../lib/sponsor/repository';
import { TournamentModule } from '../shared/tournament/tournament.module';
import { ModalRoundNumbersComponent } from './roundnumber/selector.component';

@NgModule({
  imports: [
    ClipboardModule,
    CommonModule,
    RoutingModule,
    NgbDatepickerModule, NgbTimepickerModule, NgbAlertModule, NgbPopoverModule, NgbCollapseModule, NgbModalModule, NgbButtonsModule,
    NgbNavModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    CommonSharedModule, TournamentModule
  ],
  declarations: [
    NewComponent,
    HomeComponent,
    StructureEditComponent,
    GameListComponent,
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
    GameEditComponent,
    RefereeEditComponent,
    SponsorEditComponent,
    StartBreakComponent,
    CompetitorListRemoveModalComponent,
    ModalRoundNumbersComponent
  ],
  entryComponents: [CompetitorListRemoveModalComponent, ModalRoundNumbersComponent],
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
export class AdminModule {
  constructor(library: FaIconLibrary, modalConfig: NgbModalConfig, ) {
    library.addIcons(
      /* homescreen */ faMoneyBillAlt, faCheckCircle, faTimesCircle, faShareAlt, faEye, faFileExport, faCopy, faTrashAlt
      , faQrcode, faPrint, faFileExcel,
      /* sport select*/ faDotCircle,
      /* competitors*/ faSquare, faCheckSquare, faRandom, faSort,
      /* structure*/ faCompressAlt, faExpandAlt, faTh,
      /* delen */ faClipboardCheck
      /*faCircle, faListUl, faCogs, faMinus,
      faUserTag, faInfoCircle, faMedal, faUsers, faSync*/
    );
    library.addIcons(
      faProductHunt
    );
    modalConfig.centered = true;
    modalConfig.scrollable = true;
    modalConfig.size = 'lg';
  }
}



import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faProductHunt } from '@fortawesome/free-brands-svg-icons';
import { faCheckSquare, faSquare } from '@fortawesome/free-regular-svg-icons';
import {
  faCheckCircle,
  faCopy,
  faDotCircle,
  faMoneyBillAlt,
  faFileExcel,
  faFileExport,
  faPrint,
  faQrcode,
  faRandom,
  faSort,
  faTh,
  faTimesCircle,
  faTrashAlt,
  faCompressAlt,
  faExpandAlt,
  faShareAlt,
  faEye,
  faClipboardCheck,
} from '@fortawesome/free-solid-svg-icons';
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
import { TournamentUserMapper } from '../lib/tournament/user/mapper';
import { CommonSharedModule } from '../shared/common/shared.module';
import { CompetitorEditComponent } from './competitor/edit.component';
import { CompetitorListComponent } from './competitor/list.component';
import { CompetitorListLineComponent } from './competitor/listline.component';
import { CompetitorListRemoveModalComponent } from './competitor/listremovemodal.component';
import { FieldListComponent } from './sportconfig/field/fieldlist.component';
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
import { LockerRoomMapper } from '../lib/lockerroom/mapper';
import { TournamentUserRepository } from '../lib/tournament/user/repository';
import { TournamentInvitationRepository } from '../lib/tournament/invitation/repository';
import { TournamentInvitationMapper } from '../lib/tournament/invitation/mapper';
import { AuthorizationListComponent } from './authorization/list.component';
import { AuthorizationAddComponent } from './authorization/add.component';
import { RoleItemComponent } from './authorization/roleitem.component';
import { AuthorizationExplanationModalComponent } from './authorization/infomodal.component';
import { PointsEditComponent } from './sportconfig/points/points.component';

@NgModule({
  imports: [
    ClipboardModule,
    CommonModule,
    RoutingModule,
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
    PointsEditComponent,
    SportScoreEditComponent,
    SportSelectComponent,
    SponsorListComponent,
    CompetitorEditComponent,
    PlanningConfigComponent,
    FieldListComponent,
    GameEditComponent,
    RefereeEditComponent,
    SponsorEditComponent,
    StartBreakComponent,
    CompetitorListRemoveModalComponent,
    ModalRoundNumbersComponent,
    AuthorizationListComponent,
    AuthorizationAddComponent,
    RoleItemComponent,
    AuthorizationExplanationModalComponent
  ],
  entryComponents: [AuthorizationExplanationModalComponent, CompetitorListRemoveModalComponent, ModalRoundNumbersComponent],
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
    LockerRoomMapper,
    NameService,
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
    TournamentUserRepository,
    TournamentUserMapper,
    TournamentInvitationRepository,
    TournamentInvitationMapper,
  ]
})
export class AdminModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(
      /* homescreen */ faMoneyBillAlt, faCheckCircle, faTimesCircle, faShareAlt, faEye, faFileExport, faCopy, faTrashAlt
      , faQrcode, faPrint, faFileExcel,
      /* sport select*/ faDotCircle,
      /* competitors*/ faSquare, faCheckSquare, faRandom, faSort,
      /* structure*/ faCompressAlt, faExpandAlt, faTh,
      /* delen */ faClipboardCheck
      /*faCircle, faListUl, faCogs, faMinus, faInfoCircle, faMedal, faUsers, faSync*/
    );
    library.addIcons(
      faProductHunt
    );
  }
}



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
  faListOl,
} from '@fortawesome/free-solid-svg-icons';
import { ClipboardModule } from 'ngx-clipboard';
import {
  CompetitionMapper,
  GameMapper,
  GamePlaceMapper,
  ScoreMapper,
  PlaceMapper,
  PlanningMapper,
  PouleMapper,
  RoundMapper,
  RoundNumberMapper,
  CompetitionSportService,
  ScoreConfigMapper,
  ScoreConfigService,
  StructureMapper,
  SportMapper,
  SeasonMapper,
  RefereeMapper,
  PlanningConfigMapper,
  LeagueMapper,
  FieldMapper,
  AssociationMapper
} from 'ngx-sport';

import { CSSService } from '../shared/common/cssservice';
import { TournamentUserMapper } from '../lib/tournament/user/mapper';
import { CommonSharedModule } from '../shared/common/shared.module';
import { CompetitorEditComponent } from './competitor/edit.component';
import { CompetitorListComponent } from './competitor/list.component';
import { CompetitorListLineComponent } from './competitor/listline.component';
import { CompetitorListRemoveModalComponent } from './competitor/listremovemodal.component';
import { FieldListComponent } from './competitionSport/field/fieldlist.component';
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
import { CompetitionSportEditComponent } from './competitionSport/edit.component';
import { CompetitionSportListComponent } from './competitionSport/list.component';
import { StructureEditComponent } from './structure/edit.component';
import { RoutingModule } from './admin-routing.module';
import { ScoreConfigEditComponent } from './scoreConfig/edit.component';
import { StructureRepository } from '../lib/ngx-sport/structure/repository';
import { SportRepository } from '../lib/ngx-sport/sport/repository';
import { SportConfigRepository } from '../lib/ngx-sport/sport/config/repository';
import { ScoreConfigRepository } from '../lib/ngx-sport/sport/scoreconfig/repository';
import { CompetitorRepository } from '../lib/ngx-sport/competitor/repository';
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
import { RoundNumbersSelectorModalComponent } from './roundnumber/selector.component';
import { RoundsSelectorModalComponent } from './rounds/selector.component';
import { LockerRoomMapper } from '../lib/lockerroom/mapper';
import { TournamentUserRepository } from '../lib/tournament/user/repository';
import { TournamentInvitationRepository } from '../lib/tournament/invitation/repository';
import { TournamentInvitationMapper } from '../lib/tournament/invitation/mapper';
import { AuthorizationListComponent } from './authorization/list.component';
import { AuthorizationAddComponent } from './authorization/add.component';
import { RoleItemComponent } from './authorization/roleitem.component';
import { AuthorizationExplanationModalComponent } from './authorization/infomodal.component';
import { PointsEditComponent } from './competitionSport/points/points.component';
import { CompetitorMapper } from '../lib/competitor/mapper';
import { SportDefaultService } from '../lib/ngx-sport/defaultService';
import { StructureSelectRoundComponent } from './rounds/round.component';

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
    CompetitionSportListComponent,
    CompetitionSportEditComponent,
    PointsEditComponent,
    ScoreConfigEditComponent,
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
    AuthorizationListComponent,
    AuthorizationAddComponent,
    RoleItemComponent,
    AuthorizationExplanationModalComponent,
    CompetitorListRemoveModalComponent,
    RoundNumbersSelectorModalComponent,
    RoundsSelectorModalComponent,
    StructureSelectRoundComponent
  ],
  providers: [
    AssociationMapper,
    CompetitorMapper,
    CompetitionMapper,
    CompetitorRepository,
    CompetitionSportService,
    CSSService,
    FieldMapper,
    FieldRepository,
    GameRepository,
    GameMapper,
    GamePlaceMapper,
    ScoreMapper,
    LeagueMapper,
    LockerRoomMapper,
    PlaceMapper,
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
    SportDefaultService,
    SportMapper,
    SportConfigRepository,
    SportRepository,
    ScoreConfigMapper,
    ScoreConfigService,
    ScoreConfigRepository,
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
      /* delen */ faClipboardCheck,
      /* standen */ faListOl
      /*faCircle, faListUl, faCogs, faMinus, faInfoCircle, faMedal, faUsers, faSync*/
    );
    library.addIcons(
      faProductHunt
    );
  }
}



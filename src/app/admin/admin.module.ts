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
  CompetitionSportService,
  ScoreConfigService,
} from 'ngx-sport';

import { CSSService } from '../shared/common/cssservice';
import { CommonSharedModule } from '../shared/common/shared.module';
import { CompetitorEditComponent } from './competitor/edit.component';
import { CompetitorListComponent } from './competitor/list.component';
import { CompetitorListLineComponent } from './competitor/listline.component';
import { CompetitorListRemoveModalComponent } from './competitor/listremovemodal.component';
import { FieldListComponent } from './competitionSport/field/fieldlist.component';
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
import { TournamentModule } from '../shared/tournament/tournament.module';
import { RoundNumbersSelectorModalComponent } from './roundnumber/selector.component';
import { RoundsSelectorModalComponent } from './rounds/selector.component';
import { AuthorizationListComponent } from './authorization/list.component';
import { AuthorizationAddComponent } from './authorization/add.component';
import { RoleItemComponent } from './authorization/roleitem.component';
import { AuthorizationExplanationModalComponent } from './authorization/infomodal.component';
import { StructureSelectRoundComponent } from './rounds/round.component';
import { ExportModalComponent } from './home/exportmodal.component';
import { ShareModalComponent } from './home/sharemodal.component';
import { QualifyAgainstConfigEditComponent } from './qualifyAgainstConfig/edit.component';
import { RankingRuleSetModalComponent } from './home/rankingrulesetmodal.component';
import { GameAmountConfigEditComponent } from './gameAmountConfig/edit.component';
import { SportNewComponent } from './sport/new.component';
import { GameTogetherEditComponent } from './game/edittogether.component';
import { GameAgainstEditComponent } from './game/editagainst.component';

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
    AuthorizationAddComponent,
    AuthorizationExplanationModalComponent,
    AuthorizationListComponent,
    CompetitionSportListComponent,
    CompetitionSportEditComponent,
    CompetitorEditComponent,
    CompetitorListComponent,
    CompetitorListLineComponent,
    CompetitorListRemoveModalComponent,
    ExportModalComponent,
    FieldListComponent,
    GameAmountConfigEditComponent,
    GameAgainstEditComponent,
    GameListComponent,
    GameTogetherEditComponent,
    HomeComponent,
    NewComponent,
    RefereeListComponent,
    ScoreConfigEditComponent,
    SponsorEditComponent,
    SponsorListComponent,
    SportSelectComponent,
    SportNewComponent,
    StartBreakComponent,
    StructureEditComponent,
    PlanningConfigComponent,
    QualifyAgainstConfigEditComponent,
    RankingRuleSetModalComponent,
    RefereeEditComponent,
    RoleItemComponent,
    RoundNumbersSelectorModalComponent,
    RoundsSelectorModalComponent,
    ShareModalComponent,
    StructureSelectRoundComponent,
  ],
  providers: [
    CompetitionSportService,
    CSSService,
    ScoreConfigService
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



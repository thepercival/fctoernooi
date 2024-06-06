import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faProductHunt } from '@fortawesome/free-brands-svg-icons';
import {
  faCheckCircle,
  faCopy,
  faDotCircle,
  faMoneyBillAlt,
  faFileExcel,
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
  faListOl,
  faExclamationCircle,
  faPlusCircle,
  faSave,
  faUserFriends,
  faUsers,
  faTvAlt,
  faEnvelope,
  faMobile,
  faRegistered,
  faFileLines,
} from '@fortawesome/free-solid-svg-icons';
import { ClipboardModule } from 'ngx-clipboard';
import {
  CompetitionSportEditor,
  ScoreConfigService,
} from 'ngx-sport';

import { CSSService } from '../shared/common/cssservice';
import { CommonSharedModule } from '../shared/common/shared.module';
import { CompetitorEditComponent } from './competitor/edit.component';
import { CompetitorListComponent } from './competitor/list.component';
import { CompetitorListLineComponent } from './competitor/listline.component';
import { CompetitorListRemoveModalComponent } from './competitor/listremovemodal.component';
import { FieldListComponent } from './competitionSport/field/fieldlist.component';
import { HomeAdminComponent } from './home/home.component';
import { NewComponent } from './new/new.component';
import { StartAndRecessesComponent } from './startAndRecesses/startAndRecesses.component';
import { GameListComponent } from './game/list.component';
import { PlanningConfigComponent } from './planningconfig/edit.component';
import { RefereeEditComponent } from './referee/edit.component';
import { RefereeListComponent } from './referee/list.component';
import { SponsorEditComponent } from './sponsor/edit.component';
import { SponsorListComponent } from './sponsor/list.component';
import { CompetitionSportEditComponent } from './competitionSport/edit.component';
import { CompetitionSportListComponent } from './competitionSport/list.component';
import { PlanningNavBarComponent } from './structure/planningNavBar.component';
import { RoutingModule } from './admin-routing.module';
import { ScoreConfigEditComponent } from './scoreConfig/edit.component';
import { TournamentModule } from '../shared/tournament/tournament.module';
import { RoundNumbersSelectorModalComponent } from './roundnumber/selector.component';
import { RoundsSelectorModalComponent } from './rounds/selector.component';
import { AuthorizationListComponent } from './authorization/list.component';
import { AuthorizationAddComponent } from './authorization/add.component';
import { RoleItemComponent } from './authorization/roleitem.component';
import { AuthorizationExplanationModalComponent } from './authorization/infomodal.component';
import { StructureSelectRoundComponent } from './rounds/rounds.component';
import { ExportModalComponent } from './home/exportmodal.component';
import { ShareModalComponent } from './home/sharemodal.component';
import { AgainstQualifyConfigEditComponent } from './againstQualifyConfig/edit.component';
import { GameAmountConfigEditComponent } from './gameAmountConfig/edit.component';
import { GameTogetherEditComponent } from './game/edittogether.component';
import { GameAgainstEditComponent } from './game/editagainst.component';
import { ScoreTogetherCardComponent } from './game/togetherscorecard.component';
import { TournamentPropertiesComponent } from './new/properties.component';
import { CreateSportWithFieldsComponent } from './sport/createSportWithFields.component';
import { SportToAddComponent } from './sport/toAdd.component';
import { GameBaseEditComponent } from './game/editbase.component';
import { GameAddComponent } from './game/add.component';
import { GameModeModalComponent } from './gameMode/modal.component';
import { RecessAddComponent } from './startAndRecesses/addRecess.component';
import { CategoryBaseCompetitorListComponent } from './competitor/category.base.component';
import { RankingEditComponent } from './ranking/edit.component';
import { LockerRoomsEditComponent } from './lockerrooms/lockerrooms.component';
import { StructureEditComponent } from './structure/edit.component';
import { SportIconComponent } from '../shared/tournament/sport/icon.component';
import { CategoryOrderCompetitorListComponent } from './competitor/category.order.component';
import { CompetitorPresentListComponent } from './competitor/present.component';
import { RegistrationListComponent } from './competitor/registrations/list.component';
import { RegistrationSettingsComponent } from './competitor/registrations/settings.component';
import { TournamentRegistrationEditComponent } from './registration/registration-edit.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TournamentRegistrationProcessModalComponent } from './competitor/registrations/processmodal.component';
import { TextEditorModalComponent } from './textEditor/texteditormodal.component';
import { CopiedModalComponent } from './home/copiedmodal.component';
import { HomeEditComponent } from './home/homeedit.component';
import { TournamentRulesComponent } from './home/rules.component';
import { TournamentNameAndLogoComponent } from './nameAndLogo/name-and-logo.component';
import { RegistrationsNavComponent } from './competitor/registrations/nav.component';
import { RegistrationFormComponent } from './competitor/registrations/form.component';
import { PrintServiceModalComponent } from './home/print-service-modal.component';

@NgModule({
  imports: [
    ClipboardModule,
    CommonModule,
    RoutingModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    CommonSharedModule,
    TournamentModule,
    NgbDropdownModule
  ],
  declarations: [
    AgainstQualifyConfigEditComponent,
    AuthorizationAddComponent,
    AuthorizationExplanationModalComponent,
    AuthorizationListComponent,
    CompetitionSportListComponent,
    CompetitionSportEditComponent,
    CompetitorEditComponent,
    CompetitorListComponent,
    CategoryBaseCompetitorListComponent,    
    CategoryOrderCompetitorListComponent,
    CompetitorListLineComponent,
    CompetitorListRemoveModalComponent,
    CompetitorPresentListComponent,
    CopiedModalComponent,
    CreateSportWithFieldsComponent,    
    ExportModalComponent,
    PrintServiceModalComponent,
    FieldListComponent,
    GameAddComponent,
    GameAgainstEditComponent,
    GameAmountConfigEditComponent,
    GameBaseEditComponent,
    GameListComponent,
    GameModeModalComponent,
    GameTogetherEditComponent,
    HomeAdminComponent,
    HomeEditComponent,
    LockerRoomsEditComponent,
    NewComponent,
    PlanningConfigComponent,
    PlanningNavBarComponent,
    RankingEditComponent,
    RecessAddComponent,
    RefereeListComponent,
    RefereeEditComponent,
    RegistrationFormComponent,
    RegistrationListComponent,
    RegistrationsNavComponent,
    RegistrationSettingsComponent,
    RoleItemComponent,
    RoundNumbersSelectorModalComponent,
    RoundsSelectorModalComponent,
    ScoreConfigEditComponent,
    SponsorEditComponent,
    SponsorListComponent,
    SportToAddComponent,
    StartAndRecessesComponent,
    StructureEditComponent,
    ScoreTogetherCardComponent,
    ShareModalComponent,
    StructureSelectRoundComponent,
    TextEditorModalComponent,
    TournamentPropertiesComponent,
    TournamentRegistrationEditComponent,
    TournamentRegistrationProcessModalComponent,
    TournamentRulesComponent,
    TournamentNameAndLogoComponent
  ],
  providers: [
    CompetitionSportEditor,
    CSSService,
    ScoreConfigService,
    SportIconComponent
  ]
})
export class AdminModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(
      /* homescreen */ faMoneyBillAlt, faCheckCircle, faTimesCircle, faShareAlt, faCopy, faTrashAlt
      , faQrcode, faPrint, faFileExcel,
      /* sport select*/ faDotCircle,
      /* competitors*/ faRandom, faSort,
      /* structure*/ faCompressAlt, faExpandAlt, faTh,
      /* standen */ faListOl,
      /* handmatige planningmodus */ faExclamationCircle,
      /* lockerrooms, autorisatie */ faPlusCircle,
      /* opzet */ faSave,
      /** home, autorisatie */ faUserFriends, faUsers,
      /** home */ faTvAlt,
      /** referee */ faEnvelope,
      /** registrations */ faMobile, faRegistered, faFileLines,
      /*faCircle, faListUl, faCogs, faMinus, faInfoCircle, faMedal, faUsers, faSync*/
    );
    library.addIcons(
      faProductHunt
    );
  }
}



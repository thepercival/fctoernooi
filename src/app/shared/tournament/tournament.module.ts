import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  faSync, faCogs, faFilter, faInfoCircle, faListUl, faPencilAlt, faCalendarAlt, faMedal, faSpinner,
  faLevelUpAlt, faMinus, faPlus, faDoorClosed
} from '@fortawesome/free-solid-svg-icons';
import { RoundNumberPlanningComponent } from './planning/roundnumber.component';
import { PouleRankingModalComponent } from './poulerankingmodal/rankingmodal.component';
import { EndRankingComponent } from './ranking/end.component';
import { TitleComponent } from './title/title.component';
import { StructureRoundArrangeComponent } from './structure/round/arrange.component';
import { StructureQualifyComponent } from './structure/qualify.component';
import { StructureRoundComponent } from './structure/round.component';
import { NgbNavModule, NgbAlertModule, NgbPopoverModule, NgbDatepickerModule, NgbTimepickerModule, NgbCollapseModule, NgbModalModule, NgbButtonsModule, NgbModalConfig, NgbAlertConfig, NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonSharedModule } from '../common/shared.module';
import { LockerRoomsComponent } from './lockerrooms/lockerrooms.component';
import { LockerRoomComponent } from './lockerrooms/lockerroom.component';
import { NameModalComponent } from './namemodal/namemodal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CompetitorChooseModalComponent } from './competitorchoosemodal/competitorchoosemodal.component';
import { RouterModule } from '@angular/router';
import { RankingRulesComponent } from './rankingrules/rankingrules.component';
import { facStructure, facReferee, facScoreboard, facSoccerField } from './icons';
import { CompetitionSportRouter } from './competitionSport.router';
import { InfoModalComponent } from './infomodal/infomodal.component';
import { AgainstQualifyInfoComponent } from './againstQualifyConfig/info.component';
import { TournamentIconComponent } from './icon/icon.component';
import { PouleRankingComponent } from './ranking/poule.component';
import { PouleRankingSportsComponent } from './ranking/poule/sports.component';
import { PouleRankingAgainstComponent } from './ranking/poule/against.component';
import { PouleRankingTogetherComponent } from './ranking/poule/together.component';

@NgModule({
  declarations: [
    RoundNumberPlanningComponent,
    PouleRankingModalComponent,
    CompetitorChooseModalComponent,
    EndRankingComponent,
    InfoModalComponent,
    LockerRoomsComponent, LockerRoomComponent,
    NameModalComponent,
    PouleRankingComponent,
    PouleRankingSportsComponent,
    PouleRankingAgainstComponent,
    PouleRankingTogetherComponent,
    AgainstQualifyInfoComponent,
    RankingRulesComponent,
    StructureRoundArrangeComponent, StructureQualifyComponent, StructureRoundComponent,
    TitleComponent,
    TournamentIconComponent
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    CommonSharedModule,
    RouterModule,
    NgbDatepickerModule, NgbTimepickerModule, NgbAlertModule, NgbPopoverModule, NgbCollapseModule, NgbModalModule, NgbButtonsModule, NgbProgressbarModule,
    NgbNavModule
  ],
  providers: [
    CompetitionSportRouter,
  ],
  exports: [
    EndRankingComponent,
    InfoModalComponent,
    LockerRoomsComponent,
    NameModalComponent,
    NgbAlertModule, NgbButtonsModule, NgbCollapseModule, NgbDatepickerModule, NgbModalModule, NgbNavModule, NgbPopoverModule, NgbTimepickerModule,
    PouleRankingModalComponent,
    PouleRankingComponent,
    PouleRankingSportsComponent,
    PouleRankingAgainstComponent,
    PouleRankingTogetherComponent,
    AgainstQualifyInfoComponent,
    RankingRulesComponent,
    RoundNumberPlanningComponent,
    StructureRoundComponent,
    TitleComponent,
    TournamentIconComponent,
  ]
})
export class TournamentModule {
  constructor(library: FaIconLibrary, modalConfig: NgbModalConfig, alertConfig: NgbAlertConfig) {
    library.addIcons(faSync, faCogs, faFilter, faInfoCircle, faListUl, faPencilAlt, faCalendarAlt,
      faMedal, faSpinner, faLevelUpAlt, faMinus, faDoorClosed, faPlus,
      facStructure, facReferee, facScoreboard, facSoccerField);
    modalConfig.centered = true;
    modalConfig.scrollable = true;
    modalConfig.size = 'lg';
    alertConfig.dismissible = false;
  }
}

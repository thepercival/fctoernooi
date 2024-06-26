import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  faSync, faCogs, faFilter, faInfoCircle, faListUl, faPencilAlt, faCalendarAlt, faMedal, faSpinner, faGrip,
  faLevelUpAlt, faMinus, faPlus, faDoorClosed, faBaseballBall, faBasketballBall, faChess, faFutbol, faGamepad, faHockeyPuck, faTableTennis, faVolleyballBall, faStar, faEye, faChevronRight, faUserCircle, faHome, faUserPlus, faLocationDot
} from '@fortawesome/free-solid-svg-icons';
import { RoundNumberPlanningComponent } from './games/roundnumber.component';
import { PouleRankingModalComponent } from './poulerankingmodal/rankingmodal.component';
import { RankingEndComponent } from './ranking/end.component';
import { StructureRoundArrangeComponent } from './structure/round/arrange.component';
import { StructureQualifyComponent } from './structure/qualify.component';
import { StructureRoundComponent } from './structure/round.component';
import { NgbNavModule, NgbAlertModule, NgbPopoverModule, NgbDatepickerModule, NgbTimepickerModule, NgbCollapseModule, NgbModalModule, NgbModalConfig, NgbAlertConfig, NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonSharedModule } from '../common/shared.module';
import { NameModalComponent } from './namemodal/namemodal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CompetitorChooseModalComponent } from './competitor/competitorchoosemodal.component';
import { RouterModule } from '@angular/router';
import { RankingRulesComponent } from './rankingrules/rankingrules.component';
import { facStructure, facReferee, facScoreboard, facSoccerField } from './icon/icons';
import { CompetitionSportRouter } from './competitionSport.router';
import { InfoModalComponent } from './infomodal/infomodal.component';
import { AgainstQualifyInfoComponent } from './againstQualifyConfig/info.component';
import { TournamentIconComponent } from './icon/icon.component';
import { RankingPouleComponent } from './ranking/poule.component';
import { facDarts, facTennis, facBadminton, facHockey, facSquash, facKorfball, facRugby } from './icon/sporticons';
import { TournamentNavBarComponent } from './tournamentNavBar/tournamentNavBar.component';
import { StructureCategoryComponent } from './structure/category.component';
import { CategoryChooseListComponent } from './category/chooseList.component';
import { CategoryChooseModalComponent } from './category/chooseModal.component';
import { RankingRoundComponent } from './ranking/round.component';
import { RankingCategoryComponent } from './ranking/category.component';
import { RankingAgainstComponent } from './ranking/sports/against.component';
import { RankingSportsComponent } from './ranking/sports/sports.component';
import { RankingTogetherComponent } from './ranking/sports/together.component';
import { LockerRoomComponent } from './lockerroom/lockerroom.component';
import { SportIconComponent } from './sport/icon.component';
import { QualifyModalComponent } from './structure/qualifymodal.component';
import { CategoryModalComponent } from './structure/categorymodal/categorymodal.component';
import { AdminPublicSwitcherComponent } from './structure/admin-public-switcher.component';

@NgModule({
    declarations: [
        AgainstQualifyInfoComponent,
    CategoryChooseListComponent, CategoryChooseModalComponent, CategoryModalComponent,
        CompetitorChooseModalComponent,
        InfoModalComponent,
        NameModalComponent,
        LockerRoomComponent,
        PouleRankingModalComponent,
        QualifyModalComponent,
        RankingRulesComponent,
        StructureRoundArrangeComponent, StructureQualifyComponent, StructureRoundComponent, StructureCategoryComponent,
        TournamentIconComponent,
        TournamentNavBarComponent,
        RankingEndComponent,
        RankingCategoryComponent,
        RankingRoundComponent,
        RankingPouleComponent,
        RankingSportsComponent,
        RankingAgainstComponent,
        RankingTogetherComponent,
        RoundNumberPlanningComponent, 
        SportIconComponent,
      AdminPublicSwitcherComponent

    ],
    providers: [
        CompetitionSportRouter,
    ],
    exports: [
        InfoModalComponent,
        NameModalComponent,
        NgbAlertModule, NgbCollapseModule, NgbDatepickerModule, NgbModalModule, NgbNavModule, NgbPopoverModule, NgbTimepickerModule, NgbProgressbarModule,
        PouleRankingModalComponent,
        RankingEndComponent,
        RankingCategoryComponent,
        RankingRoundComponent,
        RankingPouleComponent,
        RankingSportsComponent,
        RankingAgainstComponent,
        RankingTogetherComponent,
        AgainstQualifyInfoComponent,
        RankingRulesComponent,
        RoundNumberPlanningComponent,
        LockerRoomComponent,
        SportIconComponent,
        StructureRoundComponent,
        StructureCategoryComponent,
        TournamentIconComponent,
        TournamentNavBarComponent,
        AdminPublicSwitcherComponent
    ],
    imports: [
        CommonModule,
        FontAwesomeModule,
        ReactiveFormsModule,
        CommonSharedModule,
        RouterModule,
        NgbDatepickerModule, NgbTimepickerModule, NgbAlertModule, NgbPopoverModule, NgbCollapseModule, NgbModalModule, NgbProgressbarModule,
        NgbNavModule
    ]
})
export class TournamentModule {
  constructor(library: FaIconLibrary, modalConfig: NgbModalConfig, alertConfig: NgbAlertConfig) {
    library.addIcons(faSync, faCogs, faEye, faFilter, faInfoCircle, faListUl, faPencilAlt, faCalendarAlt,
      faMedal, faSpinner, faLevelUpAlt, faMinus, faDoorClosed, faPlus, faGrip, faChevronRight, faLocationDot,
      facStructure, facReferee, facScoreboard, facSoccerField, faStar, faSpinner, faUserCircle, faHome, faUserPlus);
    library.addIcons(
      facDarts, facTennis, facBadminton, facHockey, facSquash, facKorfball, facRugby, // inline
      faBasketballBall, faGamepad, faFutbol, faChess, faTableTennis, faBaseballBall, faHockeyPuck, faVolleyballBall // font awesome
    );
    modalConfig.centered = true;
    modalConfig.scrollable = true;
    modalConfig.size = 'lg';
    alertConfig.dismissible = false;
  }
}

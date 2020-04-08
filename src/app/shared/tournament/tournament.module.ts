import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  faSync, faCogs, faFilter, faInfoCircle, faListUl, faPencilAlt, faCalendarAlt, faMedal, faSpinner,
  faLevelUpAlt, faMinus, faPlus, faDoorClosed
} from '@fortawesome/free-solid-svg-icons';
import { RoundNumberPlanningComponent } from './planning/roundnumber.component';
import { PouleRankingModalComponent } from './poulerankingmodal/rankingmodal.component';
import { EndRankingComponent } from './ranking/end.component';
import { PouleRankingComponent } from './ranking/poule.component';
import { TitleComponent } from './title/title.component';
import { StructureRoundArrangeComponent } from './structure/round/arrange.component';
import { StructureQualifyComponent } from './structure/qualify.component';
import { StructureRoundComponent } from './structure/round.component';
import { NgbNavModule, NgbAlertModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonSharedModule } from '../common/shared.module';
import { LockerRoomsComponent } from './lockerrooms/lockerrooms.component';
import { LockerRoomComponent } from './lockerrooms/lockerroom.component';
import { NameModalComponent } from './namemodal/namemodal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CompetitorChooseModalComponent } from './competitorchoosemodal/competitorchoosemodal.component';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [
    RoundNumberPlanningComponent,
    PouleRankingModalComponent,
    CompetitorChooseModalComponent,
    NameModalComponent,
    EndRankingComponent,
    PouleRankingComponent,
    TitleComponent,
    StructureRoundArrangeComponent, StructureQualifyComponent, StructureRoundComponent,
    LockerRoomsComponent, LockerRoomComponent
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    CommonSharedModule,
    RouterModule,
    /*NgbDatepickerModule, NgbTimepickerModule, NgbAlertModule, NgbPopoverModule, NgbCollapseModule, NgbModalModule, NgbButtonsModule*/
    NgbNavModule, NgbAlertModule, NgbPopoverModule
  ],
  exports: [
    RoundNumberPlanningComponent,
    PouleRankingModalComponent,
    NameModalComponent,
    EndRankingComponent,
    PouleRankingComponent,
    TitleComponent,
    StructureRoundComponent,
    LockerRoomsComponent,
  ]
})
export class TournamentModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(faSync, faCogs, faFilter, faInfoCircle, faListUl, faPencilAlt, faCalendarAlt,
      faMedal, faSpinner, faLevelUpAlt, faMinus, faDoorClosed, faPlus);
  }
}

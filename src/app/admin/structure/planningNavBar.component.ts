import { Component, Input, OnChanges, signal, SimpleChanges, WritableSignal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  Category, JsonStructure, VoetbalRange,
} from 'ngx-sport';
import { of, delay, Subscription } from 'rxjs';

import { DateFormatter } from '../../lib/dateFormatter';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { Tournament } from '../../lib/tournament';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { faCalendarAlt, faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-tournament-planningNavBar',
    templateUrl: './planningNavBar.component.html',
    styleUrls: ['./planningNavBar.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FontAwesomeModule,NgbAlert,RouterLink]
})
export class PlanningNavBarComponent implements OnChanges {

  faSpinner = faSpinner;
  faCalendarAlt = faCalendarAlt;

  @Input() tournament!: Tournament;
  @Input() structure: JsonStructure | undefined;
  @Input() delayInSeconds: number = 2;

  public planningTotals: JsonPlanningTotals | undefined;
  public readonly processing: WritableSignal<boolean> = signal(true);
  public unknownPlanning = false;
  private refreshSubscription!: Subscription;

  constructor(
    private structureRepository: StructureRepository,
    private dateFormatter: DateFormatter
  ) {

  }

  ngOnChanges(changes: SimpleChanges) {
    // console.log(changes.structure);
    if (changes.structure !== undefined && changes.structure.currentValue !== changes.structure.previousValue) {
      this.refresh(changes.structure.currentValue);

    }
  }

  // obv structure
  refresh(structure: JsonStructure) {

    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    this.processing.set(true);
    this.unknownPlanning = false;
    this.refreshSubscription = of(structure).pipe(delay(this.delayInSeconds * 1000)).subscribe((structure: JsonStructure) => {
      const obsGetPlanningInfo = this.structureRepository.getPlanningTotals(structure, this.tournament);
      obsGetPlanningInfo.subscribe({
        next: (planningTotals: JsonPlanningTotals|undefined) => {
          if (planningTotals !== undefined) {
            this.planningTotals = planningTotals;
          } else {
            this.unknownPlanning = true;
          }
          this.processing.set(false);
        },
        error: ((e: string) => { 
          this.unknownPlanning = true;
          this.processing.set(false); 
          console.error(e);
        })
      });
    });

  }



  // get StructureScreen(): TournamentScreen { return TournamentScreen.Structure }

  openCategoryModal(category?: Category) {
    // const activeModal = this.modalService.open(NameModalComponent);

    // activeModal.result.then((categoryName: string) => {
    //   this.addCategory(categoryName);
    // }, (reason) => {
    // });
  }



  // saveStructure() {
  //   this.processing.set(true);
  //   this.setAlert(IAlertType.Info, 'wijzigingen worden opgeslagen');

  //   // console.log('pre edit-structure has child', this.clonedStructure.getCategory(1).getRootRound().getBorderQualifyGroup(QualifyTarget.Winners) !== undefined);

  //   this.structureRepository.editObject(this.clonedStructure, this.tournament)
  //     .subscribe({
  //       next: (structureRes: Structure) => {
  //         console.log('post save-structure has child', this.clonedStructure.getCategory(1).getRootRound().getBorderQualifyGroup(QualifyTarget.Winners) !== undefined);
  //         this.syncPlanning(structureRes/*this.getLowestLevelAction()*/); // should always be first roundnumber
  //       },
  //       error: (e) => { this.setAlert(IAlertType.Danger, e); this.processing.set(false); }
  //     });
  // }




  showStart(): string {
    return this.dateFormatter.toString(this.planningTotals?.start, this.dateFormatter.time());
  }

  showEnd(): string {
    return this.dateFormatter.toString(this.planningTotals?.end, this.dateFormatter.time());
  }

  showNrOfGames(): string {
    if (this.planningTotals === undefined) {
      return '';
    }
    const nrOfGamesRange = this.planningTotals.competitorAmount.nrOfGames;
    if (nrOfGamesRange.min === nrOfGamesRange.max) {
      return '' + nrOfGamesRange.min;
    }
    return nrOfGamesRange.min + ' tot ' + nrOfGamesRange.max;
  }

  showNrOfMinutes(): string {
    if (this.planningTotals === undefined) {
      return '';
    }
    const nrOfMinutesRange = this.planningTotals.competitorAmount.nrOfMinutes;
    if (nrOfMinutesRange.min === nrOfMinutesRange.max) {
      return '' + nrOfMinutesRange.min;
    }
    return nrOfMinutesRange.min + ' tot ' + nrOfMinutesRange.max;
  }
}

export interface JsonPlanningTotals {
  start: Date;
  end: Date;
  competitorAmount: JsonCompetitorAmount;
}

export interface JsonCompetitorAmount {
  nrOfGames: VoetbalRange;
  nrOfMinutes: VoetbalRange;
}



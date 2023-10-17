import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import {
  Category, JsonStructure, Structure, VoetbalRange,
} from 'ngx-sport';
import { of, delay, pipe, concatMap, Subscription } from 'rxjs';

import { DateFormatter } from '../../lib/dateFormatter';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { Tournament } from '../../lib/tournament';

@Component({
  selector: 'app-tournament-planningNavBar',
  templateUrl: './planningNavBar.component.html',
  styleUrls: ['./planningNavBar.component.scss'],
})
export class PlanningNavBarComponent implements OnChanges {

  @Input() tournament!: Tournament;
  @Input() structure: JsonStructure | undefined;
  @Input() delayInSeconds: number = 2;

  public planningInfo: JsonPlanningInfo | undefined;
  public processing = true;
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

    this.processing = true;
    this.unknownPlanning = false;
    this.refreshSubscription = of(structure).pipe(delay(this.delayInSeconds * 1000)).subscribe((structure: JsonStructure) => {
      const obsGetPlanningInfo = this.structureRepository.getPlanningInfo(structure, this.tournament);
      obsGetPlanningInfo.subscribe({
        next: (planningInfo: JsonPlanningInfo) => {
          this.planningInfo = planningInfo;
          this.processing = false;
        },
        error: ((e: string) => { this.unknownPlanning = true; this.processing = false; })
      });
    });

  }



  // get StructureScreen(): TournamentScreen { return TournamentScreen.Structure }

  openCategoryModal(category?: Category) {
    // const activeModal = this.modalService.open(NameModalComponent);
    // activeModal.componentInstance.header = 'categorie';
    // activeModal.componentInstance.range = { min: 3, max: 15 };
    // activeModal.componentInstance.placeHolder = 'Jongens 7/8';
    // activeModal.componentInstance.labelName = 'naam';
    // activeModal.componentInstance.buttonName = category ? 'wijzigen' : 'toevoegen';

    // activeModal.result.then((categoryName: string) => {
    //   this.addCategory(categoryName);
    // }, (reason) => {
    // });
  }



  // saveStructure() {
  //   this.processing = true;
  //   this.setAlert(IAlertType.Info, 'wijzigingen worden opgeslagen');

  //   // console.log('pre edit-structure has child', this.clonedStructure.getCategory(1).getRootRound().getBorderQualifyGroup(QualifyTarget.Winners) !== undefined);

  //   this.structureRepository.editObject(this.clonedStructure, this.tournament)
  //     .subscribe({
  //       next: (structureRes: Structure) => {
  //         console.log('post save-structure has child', this.clonedStructure.getCategory(1).getRootRound().getBorderQualifyGroup(QualifyTarget.Winners) !== undefined);
  //         this.syncPlanning(structureRes/*this.getLowestLevelAction()*/); // should always be first roundnumber
  //       },
  //       error: (e) => { this.setAlert(IAlertType.Danger, e); this.processing = false; }
  //     });
  // }




  showStart(): string {
    return this.dateFormatter.toString(this.planningInfo?.start, this.dateFormatter.time());
  }

  showEnd(): string {
    return this.dateFormatter.toString(this.planningInfo?.end, this.dateFormatter.time());
  }

  showNrOfGames(): string {
    if (this.planningInfo === undefined) {
      return '';
    }
    const competitorAmount = this.planningInfo.competitorAmount;
    if (competitorAmount.allTheSame) {
      return '' + competitorAmount.nrOfGames.min;
    }
    return competitorAmount.nrOfGames.min + ' tot ' + competitorAmount.nrOfGames.max;
  }

  showNrOfMinutes(): string {
    if (this.planningInfo === undefined) {
      return '';
    }
    const competitorAmount = this.planningInfo.competitorAmount;
    if (competitorAmount.allTheSame) {
      return '' + competitorAmount.nrOfMinutes.min;
    }
    return competitorAmount.nrOfMinutes.min + ' tot ' + competitorAmount.nrOfMinutes.max;
  }
}

export interface JsonPlanningInfo {
  start: Date;
  end: Date;
  competitorAmount: JsonCompetitorAmount;
}

export interface JsonCompetitorAmount {
  allTheSame: boolean;
  nrOfGames: VoetbalRange;
  nrOfMinutes: VoetbalRange;
}



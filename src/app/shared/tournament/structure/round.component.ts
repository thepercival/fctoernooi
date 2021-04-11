import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { HorizontalPoule, NameService, QualifyGroup, Round, RoundNumber, Competitor, CompetitorMap, StructureEditor, QualifyTarget, SingleQualifyRule } from 'ngx-sport';

import { IAlert } from '../../common/alert';
import { CSSService } from '../../common/cssservice';

@Component({
  selector: 'app-tournament-structureround',
  templateUrl: './round.component.html',
  styleUrls: ['./round.component.css']
})
export class StructureRoundComponent implements OnInit {

  @Input() round!: Round;
  @Output() roundNumberChanged = new EventEmitter<RoundNumber>();
  @Input() editable: boolean = false;
  @Input() first!: boolean;
  @Input() favorites: Competitor[] = [];
  @Input() competitorMap!: CompetitorMap;
  alert: IAlert | undefined;
  public nameService!: NameService;

  constructor(private structureEditor: StructureEditor, public cssService: CSSService) {
    this.resetAlert();
  }

  ngOnInit() {
    this.nameService = new NameService(this.competitorMap);
  }

  arrangeAction(action: string) {
    this.resetAlert();
    try {
      if (action === 'addPouleToRootRound') {
        this.structureEditor.addPouleToRootRound(this.round);
      } else if (action === 'removePouleFromRootRound') {
        this.structureEditor.removePouleFromRootRound(this.round);
      } else if (action === 'addPlaceToRootRound') {
        this.structureEditor.addPlaceToRootRound(this.round);
      } else if (action === 'removePlaceFromRootRound') {
        this.structureEditor.removePlaceFromRootRound(this.round);
      } else if (action === 'incrementNrOfPoules') {
        this.structureEditor.incrementNrOfPoules(this.round);
      } else if (action === 'decrementNrOfPoules') {
        this.structureEditor.decrementNrOfPoules(this.round);
      }
      this.nameService = new NameService(this.competitorMap);
      this.roundNumberChanged.emit(this.round.getNumber());
    } catch (e) {
      this.setAlert('danger', e.message);
    }
  }

  get TargetWINNERS(): QualifyTarget {
    return QualifyTarget.Winners;
  }

  get TargetLOSERS(): QualifyTarget {
    return QualifyTarget.Losers;
  }

  // getEditHorizontalPoules(): HorPouleEdit[] {
  // TODOSTRUCTURE CDK
  // return [];
  // const horizontalPoulesWinners: HorizontalPoule[] = [];    
  // // QualifyTarget.Winners
  // this.round.getQualifyGroups(QualifyTarget.Winners).forEach(qualifyGroup => {
  //   qualifyGroup.getHorizontalPoules().forEach(horizontalPoule => {
  //     if (horizontalPoule.getNrOfQualifiers() > 1) {
  //       horizontalPoulesWinners.push(horizontalPoule);
  //     }
  //   });
  // });

  // // QualifyTarget.Losers
  // const horizontalPoulesLosers: HorizontalPoule[] = [];
  // this.round.getQualifyGroups(QualifyTarget.Losers).forEach(qualifyGroup => {
  //   qualifyGroup.getHorizontalPoules().forEach(horizontalPoule => {
  //     if (horizontalPoule.getNrOfQualifiers() > 1) {
  //       horizontalPoulesLosers.unshift(horizontalPoule);
  //     }
  //   });
  // });

  // // QualifyGroup.DROPOUTS
  // const lastWinnersHorPoule = horizontalPoulesWinners[horizontalPoulesWinners.length - 1];
  // const lastLosersHorPoule = horizontalPoulesLosers[0]; // because losers are unshifted instead of pushed
  // const horizontalPoulesDropouts: HorizontalPoule[] = this.round.getHorizontalPoules(QualifyTarget.Winners).filter(horizontalPoule => {
  //   return ((!lastWinnersHorPoule || horizontalPoule.getPlaceNumber() > lastWinnersHorPoule.getPlaceNumber())
  //     && (!lastLosersHorPoule || horizontalPoule.getPlaceNumber() < lastLosersHorPoule.getPlaceNumber())
  //   );
  // });

  // let horizontalPoules: HorizontalPoule[] = horizontalPoulesWinners.concat(horizontalPoulesDropouts);
  // horizontalPoules = horizontalPoules.concat(horizontalPoulesLosers);

  // const editHorPoules: EditHorPoule[] = [];
  // let previous: HorizontalPoule | undefined;
  // horizontalPoules.forEach((horizontalPoule: HorizontalPoule) => {
  //   const editHorPoule: EditHorPoule = { current: horizontalPoule, previous: previous };
  //   editHorPoules.push(editHorPoule);
  //   previous = horizontalPoule;
  // });
  // return editHorPoules;
  //}

  isQualifyGroupSplittableAt(singleRule: SingleQualifyRule): boolean {

    // const prevHorPoule = editHorPoule.previous;
    // if (prevHorPoule === undefined) {
    //   return false;
    // }
    return this.structureEditor.isQualifyGroupSplittableAt(singleRule);
  }

  areQualifyGroupsMergable(groupA: QualifyGroup, groupB: QualifyGroup): boolean {
    return this.structureEditor.areQualifyGroupsMergable(groupA, groupB);
  }

  splitQualifyGroupFrom(group: QualifyGroup, singleRule: SingleQualifyRule) {
    this.structureEditor.splitQualifyGroupFrom(group, singleRule);
    this.roundNumberChanged.emit(this.round.getNumber());
  }

  mergeQualifyGroups(groupA: QualifyGroup, groupB: QualifyGroup) {
    this.structureEditor.mergeQualifyGroups(groupA, groupB);
    this.roundNumberChanged.emit(this.round.getNumber());
  }

  getQualifyGroupWidthPercentage(qualifyGroup: QualifyGroup): number {
    // TODOSTRUCTURE CDK
    return 0;
    // const nrOfPoules = qualifyGroup.getChildRound().getPoules().length;
    // return Math.floor((nrOfPoules / this.getNrOfPoulesChildren(qualifyGroup.getRound())) * 100);
  }

  getNrOfPoulesChildren(round: Round): number {
    let nrOfChildPoules = 0;
    round.getQualifyGroups().forEach(qualifyGroup => {
      nrOfChildPoules += qualifyGroup.getChildRound().getPoules().length;
    });
    return nrOfChildPoules;
  }

  isFavorite(competitor: Competitor | undefined) {
    if (competitor === undefined) {
      return false;
    }
    return this.favorites && this.favorites.indexOf(competitor) >= 0;
  }

  protected resetAlert(): void {
    this.alert = undefined;
  }

  protected setAlert(type: string, message: string) {
    this.alert = { type: type, message: message };
  }
}

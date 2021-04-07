import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { HorizontalPoule, NameService, QualifyGroup, Round, RoundNumber, Competitor, CompetitorMap, StructureEditor, QualifyTarget } from 'ngx-sport';

import { IAlert } from '../../common/alert';
import { CSSService } from '../../common/cssservice';
import { StructureViewType } from './qualify.component';

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
  viewType: number = StructureViewType.ROUNDSTRUCTURE;
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
      if (action === 'decrementNrOfPoules') {
        this.decrementNrOfPoules();
      } else if (action === 'incrementNrOfPoules') {
        this.incrementNrOfPoules();
      } else if (action === 'removePlace') {
        this.removePlace();
      } else if (action === 'addPlace') {
        this.addPlace();
      }
      this.roundNumberChanged.emit(this.round.getNumber());
    } catch (e) {
      this.setAlert('danger', e.message);
    }
  }

  get QualifyGroupWINNERS(): QualifyTarget {
    return QualifyTarget.Winners;
  }

  get QualifyGroupLOSERS(): QualifyTarget {
    return QualifyTarget.Losers;
  }

  get ViewTypeQualifyGroups(): StructureViewType {
    return StructureViewType.QUALIFYGROUPS;
  }

  protected decrementNrOfPoules() {
    this.structureEditor.decrementNrOfPoules(this.round);
  }

  protected incrementNrOfPoules() {
    this.structureEditor.incrementNrOfPoules(this.round);
  }

  protected removePlace() {
    if (this.round.isRoot()) {
      this.structureEditor.removePlaceFromRootRound(this.round);
    }
  }

  protected addPlace() {
    if (this.round.isRoot()) {
      this.structureEditor.addPlaceToRootRound(this.round);
    }
  }

  getEditHorizontalPoules(): HorPouleEdit[] {
    // TODOSTRUCTURE CDK
    return [];
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
  }

  isQualifyGroupSplittable(editHorPoule: HorPouleEdit): boolean {
    // TODOSTRUCTURE CDK
    return false;
    // const prevHorPoule = editHorPoule.previous;
    // if (prevHorPoule === undefined) {
    //   return false;
    // }
    // return this.structureEditor.isQualifyGroupSplittable(prevHorPoule, editHorPoule.current);
  }

  areQualifyGroupsMergable(editHorPoule: HorPouleEdit): boolean {
    // TODOSTRUCTURE CDK
    return false;
    // const previousQualifyGroup = editHorPoule.previous?.getQualifyGroup();
    // const currentQualifyGroup = editHorPoule.current.getQualifyGroup();
    // if (!previousQualifyGroup || !currentQualifyGroup) {
    //   return false;
    // }
    // return this.structureEditor.areQualifyGroupsMergable(previousQualifyGroup, currentQualifyGroup);
  }

  splitQualifyGroup(editHorPoule: HorPouleEdit) {
    // TODOSTRUCTURE CDK
    return;
    // const previousQualifyGroup = editHorPoule.previous?.getQualifyGroup();
    // if (!previousQualifyGroup || !editHorPoule.previous) {
    //   return;
    // }
    // this.structureEditor.splitQualifyGroupFrom(previousQualifyGroup, editHorPoule.previous);
    // this.roundNumberChanged.emit(this.round.getNumber());
  }

  mergeQualifyGroups(editHorPoule: HorPouleEdit) {
    // TODOSTRUCTURE CDK
    return;
    // const previousQualifyGroup = editHorPoule.previous?.getQualifyGroup();
    // const currentQualifyGroup = editHorPoule.current.getQualifyGroup();
    // if (!previousQualifyGroup || !currentQualifyGroup) {
    //   return;
    // }
    // this.structureEditor.mergeQualifyGroups(previousQualifyGroup, currentQualifyGroup);
    // this.roundNumberChanged.emit(this.round.getNumber());
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

interface HorPouleEdit {
  current: HorizontalPoule;
  qualifyGroup: QualifyGroup;
  previous: HorizontalPoule | undefined;
}


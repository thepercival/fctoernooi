import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HorizontalPoule, NameService, QualifyGroup, Round, RoundNumber, StructureService } from 'ngx-sport';

import { CSSService } from '../../common/cssservice';
import { Tournament } from '../../lib/tournament';
import { StructureViewType } from './main.component';

@Component({
  selector: 'app-tournament-structureround',
  templateUrl: './round.component.html',
  styleUrls: ['./round.component.css']
})
export class TournamentStructureRoundComponent {

  @Input() round: Round;
  @Output() roundNumberChanged = new EventEmitter<RoundNumber>();
  @Input() editable: boolean;
  @Input() viewType: StructureViewType;
  public alert: any;
  private structureService: StructureService;

  constructor(public nameService: NameService, public cssService: CSSService) {
    this.resetAlert();
    this.structureService = new StructureService({ min: Tournament.MINNROFCOMPETITORS, max: Tournament.MAXNROFCOMPETITORS });
  }

  arrangeAction(action: string) {
    this.resetAlert();
    try {
      if (action === 'removePoule') {
        this.removePoule();
      } else if (action === 'addPoule') {
        this.addPoule();
      } else if (action === 'removePlace') {
        this.removePlace();
      } else if (action === 'addPlace') {
        this.addPlace();
      }
    } catch (e) {
      this.setAlert('danger', e.message);
    }
  }

  get QualifyGroupWINNERS(): number {
    return QualifyGroup.WINNERS;
  }

  get QualifyGroupLOSERS(): number {
    return QualifyGroup.LOSERS;
  }

  get ViewTypeQualifyGroups(): number {
    return StructureViewType.QUALIFYGROUPS;
  }

  protected removePoule() {
    this.structureService.removePoule(this.round, this.round.isRoot());
  }

  protected addPoule() {
    this.structureService.addPoule(this.round, this.round.isRoot());
  }

  protected removePlace() {
    if (this.round.isRoot()) {
      this.structureService.removePlaceFromRootRound(this.round);
    }
  }

  protected addPlace() {
    if (this.round.isRoot()) {
      this.structureService.addPlaceToRootRound(this.round);
    }
  }

  getEditHorizontalPoules(): EditHorPoule[] {
    const horizontalPoulesWinners: HorizontalPoule[] = [];
    // QualifyGroup.WINNERS
    this.round.getQualifyGroups(QualifyGroup.WINNERS).forEach(qualifyGroup => {
      qualifyGroup.getHorizontalPoules().forEach(horizontalPoule => {
        if (horizontalPoule.getNrOfQualifiers() > 1) {
          horizontalPoulesWinners.push(horizontalPoule);
        }
      })
    });

    // QualifyGroup.LOSERS
    const horizontalPoulesLosers: HorizontalPoule[] = [];
    this.round.getQualifyGroups(QualifyGroup.LOSERS).forEach(qualifyGroup => {
      qualifyGroup.getHorizontalPoules().forEach(horizontalPoule => {
        if (horizontalPoule.getNrOfQualifiers() > 1) {
          horizontalPoulesLosers.push(horizontalPoule);
        }
      })
    });

    // QualifyGroup.DROPOUTS
    const lastWinnersHorPoule = horizontalPoulesWinners[horizontalPoulesWinners.length - 1];
    const lastLosersHorPoule = horizontalPoulesLosers[horizontalPoulesLosers.length - 1];
    const horizontalPoulesDropouts: HorizontalPoule[] = this.round.getHorizontalPoules(QualifyGroup.WINNERS).filter(horizontalPoule => {
      return ((!lastWinnersHorPoule || horizontalPoule.getPlaceNumber() > lastWinnersHorPoule.getPlaceNumber())
        && (!lastLosersHorPoule || horizontalPoule.getPlaceNumber() < lastLosersHorPoule.getPlaceNumber())
      );
    });

    let horizontalPoules: HorizontalPoule[] = horizontalPoulesWinners.concat(horizontalPoulesDropouts);
    horizontalPoules = horizontalPoules.concat(horizontalPoulesLosers);

    const editHorPoules: EditHorPoule[] = [];
    let previous;
    horizontalPoules.forEach(horizontalPoule => {
      editHorPoules.push({ current: horizontalPoule, previous: previous });
      previous = horizontalPoule;
    });
    return editHorPoules;
  }

  areQualifyGroupsSplittable(editHorPoule: EditHorPoule): boolean {
    if (!editHorPoule.previous || !editHorPoule.previous.getQualifyGroup()
      || editHorPoule.previous.getQualifyGroup() !== editHorPoule.current.getQualifyGroup()) {
      return false;
    }
    if (editHorPoule.previous.isBorderPoule() && editHorPoule.previous.getNrOfQualifiers() < 2) {
      return false;
    }
    if (editHorPoule.current.isBorderPoule() && editHorPoule.current.getNrOfQualifiers() < 2) {
      return false;
    }
    return true;
  }

  areQualifyGroupsMergable(editHorPoule: EditHorPoule): boolean {
    return (editHorPoule.previous && editHorPoule.previous.getQualifyGroup() && editHorPoule.current.getQualifyGroup()
      && editHorPoule.previous.getQualifyGroup().getWinnersOrLosers() !== QualifyGroup.DROPOUTS
      && editHorPoule.previous.getQualifyGroup().getWinnersOrLosers() !== editHorPoule.current.getQualifyGroup().getWinnersOrLosers()
      && editHorPoule.previous.getQualifyGroup() !== editHorPoule.current.getQualifyGroup());
  }

  splitQualifyGroup(editHorPoule: EditHorPoule) {
    this.structureService.splitQualifyGroup(editHorPoule.previous.getQualifyGroup(), editHorPoule.previous, editHorPoule.current);
  }

  mergeQualifyGroups(editHorPoule: EditHorPoule) {

  }

  // getPlaceNumbers(): number[] {
  //   const losersHorPoule = this.round.getFirstHorizontalPoule(QualifyGroup.LOSERS);
  //   const maxPlaceNumber = losersHorPoule.getFirstPlace().getNumber();
  //   const placeNumbers = [];
  //   for (let placeNumber = 1; placeNumber <= 6; placeNumber++) {
  //     placeNumbers.push(placeNumber);
  //   }
  //   return placeNumbers;
  // }

  // private getStructureService(): StructureService {
  //   return this.structureService;
  // }

  // getWinnersLosersDescription(winnersOrLosers: number): string {
  //   return this.nameService.getWinnersLosersDescription(winnersOrLosers, true);
  // }

  // canExpand(): boolean {
  //   return (this.round.getNrOfPlaces() / (this.round.getPoules().length + 1)) >= 2;
  // }

  // canRemovePoulePlace(round: Round) {
  //   return !this.hasMinimumNrOfPlacesPerPoule(round);
  // }

  // hasMinimumNrOfPlacesPerPoule(round: Round) {
  //   return (round.getPoules().length * 2) === round.getNrOfPlaces();
  // }

  // getPlaceNumbers(round: Round): number[] {
  //   const placeNumbers: number[] = [];
  //   const nrOfPlacesPerPoule = this.structureService.getNrOfPlacesPerPoule(round.getNrOfPlaces(), round.getPoules().length);
  //   for (let placeNr = 0; placeNr < nrOfPlacesPerPoule; placeNr++) {
  //     placeNumbers.push(placeNr);
  //   }
  //   return placeNumbers;
  // }


  // getDivisionClasses(round: Round): string {
  //   const nrOfRounds = round.getNumber().getRounds().length;
  //   let classes = '';
  //   if (nrOfRounds > 2) {
  //     classes += 'more-than-two-rounds';
  //   }
  //   if (nrOfRounds > 4) {
  //     classes += ' more-than-four-rounds';
  //   }
  //   if (nrOfRounds > 8) {
  //     classes += ' more-than-eight-rounds';
  //   }
  //   return classes;
  // }

  protected resetAlert(): void {
    this.alert = undefined;
  }

  protected setAlert(type: string, message: string) {
    this.alert = { type: type, message: message };
  }
}

interface EditHorPoule {
  current: HorizontalPoule;
  previous: HorizontalPoule;
}

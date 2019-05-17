import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NameService, Round, RoundNumber, StructureService } from 'ngx-sport';
import { max } from 'rxjs/operators';

import { CSSService } from '../../common/cssservice';
import { Tournament } from '../../lib/tournament';

@Component({
  selector: 'app-tournament-structureround',
  templateUrl: './round.component.html',
  styleUrls: ['./round.component.css']
})
export class TournamentStructureRoundComponent {

  @Input() round: Round;
  @Output() roundNumberChanged = new EventEmitter<RoundNumber>();
  @Input() editable: boolean;
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
  // rearrange(nrOfPlaces: number, nrOfPoules: number) {
  //   this.structureService.rearrange(round, nrOfPlaces, nrOfPoules);
  // }

  protected removePoule() {
    if (this.round.isRoot()) {
      // poule verwijderen maar wel hetzelfde aantal deelnemers behouden
      this.structureService.removePouleFromRootRound(this.round);
    } else {
      // poule verwijderen, ??
    }
  }

  protected addPoule() {
    if (this.round.isRoot()) {
      // poule toevoegen met zelfde aantal deelnemers als laatste poule
      this.structureService.addPouleToRootRound(this.round);
    } else {
      // poule toevoegen, maar zelfde aantal deelnemers behouden
    }
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





  // private getStructureService(): StructureService {
  //   return this.structureService;
  // }

  // getWinnersLosersDescription(winnersOrLosers: number): string {
  //   return this.nameService.getWinnersLosersDescription(winnersOrLosers, true);
  // }

  // canExpand(): boolean {
  //   return (this.round.getNrOfPlaces() / (this.round.getPoules().length + 1)) >= 2;
  // }

  // addPoule(round, fillPouleToMinimum = true): void {
  //   this.resetAlert();
  //   const structureService = this.getStructureService();
  //   structureService.addPoule(round, fillPouleToMinimum ? 2 : 0);
  //   if (round.getNumber() > 1) {
  //     structureService.recalculateQualifyRulesForRound(round);
  //   }
  //   // this.getPlanningService().create(round.getNumber());
  //   this.roundNumberChanged.emit(round.getNumber());
  // }


  // removePoule(round): void {
  //   this.resetAlert();
  //   try {
  //     this.getStructureService().removePoule(round);
  //     // this.getPlanningService().create(round.getNumber());
  //     this.roundNumberChanged.emit(round.getNumber());
  //   } catch (e) {
  //     this.setAlert('danger', e.message);
  //   }
  // }

  // addPoulePlace(round): void {
  //   this.resetAlert();
  //   try {
  //     const structureService = this.getStructureService();
  //     structureService.addPoulePlace(round);
  //     if (round.getNumber() > 1) {
  //       structureService.recalculateQualifyRulesForRound(round);
  //     }
  //     // this.getPlanningService().create(round.getNumber());
  //     this.roundNumberChanged.emit(round.getNumber());
  //   } catch (e) {
  //     this.setAlert('danger', e.message);
  //   }
  // }

  // removePoulePlace(round): void {
  //   this.resetAlert();
  //   try {
  //     this.getStructureService().removePoulePlace(round);
  //     // this.getPlanningService().create(round.getNumber());
  //     this.roundNumberChanged.emit(round.getNumber());
  //   } catch (e) {
  //     this.setAlert('danger', e.message);
  //   }
  // }

  // canRemovePoulePlace(round: Round) {
  //   return !this.hasMinimumNrOfPlacesPerPoule(round);
  // }

  // hasMinimumNrOfPlacesPerPoule(round: Round) {
  //   return (round.getPoules().length * 2) === round.getNrOfPlaces();
  // }

  // getMaxSliderValue(winnersOrLosers: number): number {
  //   console.error('getMaxSliderValue');
  //   return 0;
  //   // const opposing = Round.getOpposing(winnersOrLosers);
  //   // const max = this.round.getNrOfPlaces() - this.round.getNrOfPlacesChildRound(opposing);
  //   // if (max < 1) {
  //   //   return 1;
  //   // }
  //   // return max;
  // }



  // protected setAlert(type: string, message: string): boolean {
  //   this.alert = { 'type': type, 'message': message };
  //   return (type === 'success');
  // }

  // startSliding(nrOfChildPlaces: number, winnersOrLosers: number) {
  //   const maxNrOfPlaces = this.calcMaxNrOfPlacesPerPoule(this.round, winnersOrLosers);
  //   this.getStructureService().setMaxNrOfPoulePlacesForChildRound(maxNrOfPlaces);
  // }

  // getPlaceNumbers(round: Round): number[] {
  //   const placeNumbers: number[] = [];
  //   const nrOfPlacesPerPoule = this.structureService.getNrOfPlacesPerPoule(round.getNrOfPlaces(), round.getPoules().length);
  //   for (let placeNr = 0; placeNr < nrOfPlacesPerPoule; placeNr++) {
  //     placeNumbers.push(placeNr);
  //   }
  //   return placeNumbers;
  // }

  // getNrOfPlacesPerPoule(round: Round) {
  //   this.structureService.getNrOfPlacesPerPoule(round.getNrOfPlaces(), round.getPoules().length);
  // }

  // protected calcMaxNrOfPlacesPerPoule(parentRound: Round, winnersOrLosers: number): number {
  //   console.error('calcMaxNrOfPlacesPerPoule');
  //   return 0;
  //   // const nrOfChildRoundPlaces = parentRound.getNrOfPlacesChildRound(winnersOrLosers);
  //   // const childRound = parentRound.getChildRound(winnersOrLosers);
  //   // if (childRound === undefined) {
  //   //   return 2;
  //   // }
  //   // const structureService = this.getStructureService();
  //   // return structureService.getNrOfPlacesPerPoule(nrOfChildRoundPlaces, childRound.getPoules().length);
  // }

  // public onSliderChange(nrOfChildPlacesNew: number, winnersOrLosers: number) {
  //   console.error('onSliderChange, do only something when letting loose');
  //   // if ((nrOfChildPlacesNew + this.round.getNrOfPlacesChildRound(Round.getOpposing(winnersOrLosers))) > this.round.getNrOfPlaces()) {
  //   //   return;
  //   // }
  //   // this.getStructureService().changeNrOfPlacesChildRound(nrOfChildPlacesNew, this.round, winnersOrLosers);
  //   // // this.getPlanningService().create(this.round.getNumber());
  //   // if (this.round.getNumber().hasNext()) {
  //   //   this.roundNumberChanged.emit(this.round.getNumber().getNext());
  //   // }
  // }

  // endSliding(nrOfChildPlaces: number, winnersOrLosers: number) {
  //   this.checkRoundWithOnePoulePlace(nrOfChildPlaces, winnersOrLosers);
  // }

  // checkRoundWithOnePoulePlace(nrOfPoulePlacesChildRound: number, winnersOrLosers: number) {
  //   console.log('checkRoundWithOnePoulePlace');
  //   // if (nrOfPoulePlacesChildRound !== 1 || this.round.getNrOfPlacesChildren(winnersOrLosers) !== 1) {
  //   //   return;
  //   // }
  //   const nextRoundNumber = this.round.getNumber().getNext();
  //   this.getStructureService().removeChildRound(this.round, winnersOrLosers);
  //   this.roundNumberChanged.emit(nextRoundNumber);
  // }

  // canChangeQualifyOrder(): boolean {
  //   console.error('canChangeQualifyOrder');
  //   return true;
  //   // !this.round.hasCustomQualifyOrder() &&
  //   //   this.round.getPoules().length >= 2 /*&& (this.round.getNumber().getRounds().length - 1) <= 1*/;
  // }

  // toggleQualifyOrder(round: Round) {
  //   console.error('toggleQualifyOrder');
  //   // this.resetAlert();
  //   // round.setQualifyOrder(this.qualifyOrderIsCross(round) ? Round.QUALIFYORDER_RANK : Round.QUALIFYORDER_CROSS);
  //   // this.getStructureService().recalculateQualifyRulesForRound(round);
  //   // // this.getPlanningService().create(round.getNumber());
  //   // this.roundNumberChanged.emit(round.getNumber());
  // }

  // qualifyOrderIsCross(round: Round) {
  //   console.error('qualifyOrderIsCross');
  //   return true;
  //   // return round.getQualifyOrder() === Round.QUALIFYORDER_CROSS;
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

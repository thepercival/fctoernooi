import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NameService, PoulePlace, Round, RoundNumber, StructureService } from 'ngx-sport';
import { max } from 'rxjs/operators';

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
  public sliderValueDummy = 3;
  private structureService: StructureService;
  public uiSliderConfigWinners: any = {
    behaviour: 'drag',
    margin: 1,
    step: 1,
    tooltips: [true]
  };
  public uiSliderConfigLosers: any = {
    behaviour: 'drag',
    margin: 1,
    step: 1,
    tooltips: [true]
  };

  constructor(public nameService: NameService) {
    this.resetAlert();
    this.structureService = new StructureService({ min: Tournament.MINNROFCOMPETITORS, max: Tournament.MAXNROFCOMPETITORS });
  }

  get RoundWINNERS(): number {
    return Round.WINNERS;
  }

  get RoundLOSERS(): number {
    return Round.LOSERS;
  }

  private getStructureService(): StructureService {
    return this.structureService;
  }

  getWinnersLosersName(winnersOrLosers: number): string {
    return winnersOrLosers === Round.WINNERS ? 'winners' : 'losers';
  }

  getWinnersLosersDescription(winnersOrLosers: number): string {
    return Round.getWinnersLosersDescription(winnersOrLosers, true);
  }

  canExpand(): boolean {
    return (this.round.getPoulePlaces().length / (this.round.getPoules().length + 1)) >= 2;
  }

  addPoule(round, fillPouleToMinimum = true): void {
    this.resetAlert();
    const structureService = this.getStructureService();
    structureService.addPoule(round, fillPouleToMinimum ? 2 : 0);
    if (round.getNumber() > 1) {
      structureService.recalculateQualifyRulesForRound(round);
    }
    // this.getPlanningService().create(round.getNumber());
    this.roundNumberChanged.emit(round.getNumber());
  }


  removePoule(round): void {
    this.resetAlert();
    try {
      this.getStructureService().removePoule(round);
      // this.getPlanningService().create(round.getNumber());
      this.roundNumberChanged.emit(round.getNumber());
    } catch (e) {
      this.setAlert('danger', e.message);
    }
  }

  addPoulePlace(round): void {
    this.resetAlert();
    try {
      const structureService = this.getStructureService();
      structureService.addPoulePlace(round);
      if (round.getNumber() > 1) {
        structureService.recalculateQualifyRulesForRound(round);
      }
      // this.getPlanningService().create(round.getNumber());
      this.roundNumberChanged.emit(round.getNumber());
    } catch (e) {
      this.setAlert('danger', e.message);
    }
  }

  removePoulePlace(round): void {
    this.resetAlert();
    try {
      this.getStructureService().removePoulePlace(round);
      // this.getPlanningService().create(round.getNumber());
      this.roundNumberChanged.emit(round.getNumber());
    } catch (e) {
      this.setAlert('danger', e.message);
    }
  }

  canRemovePoulePlace(round: Round) {
    return !this.hasMinimumNrOfTeamsPerPoule(round);
  }

  hasMinimumNrOfTeamsPerPoule(round: Round) {
    return (round.getPoules().length * 2) === round.getPoulePlaces().length;
  }

  getMaxSliderValue(winnersOrLosers: number): number {
    const opposing = Round.getOpposing(winnersOrLosers);
    const max = this.round.getNrOfPlaces() - this.round.getNrOfPlacesChildRound(opposing);
    if (max < 1) {
      return 1;
    }
    return max;
  }

  getClassPostfix(winnersOrLosers: number): string {
    return winnersOrLosers === Round.WINNERS ? 'success' : (winnersOrLosers === Round.LOSERS ? 'danger' : '');
  }

  getClassForPoulePlace(poulePlace: PoulePlace): string {
    const rules = poulePlace.getToQualifyRules();
    if (rules.length === 2) {
      return 'text-warning';
    } else if (rules.length === 1) {
      const qualifyRule = rules[0];
      const singleColor = this.getClassPostfix(qualifyRule.getWinnersOrLosers());
      return 'text-' + (qualifyRule.getFromPoulePlaces().length === qualifyRule.getToPoulePlaces().length ? singleColor : 'warning');
    }
    return '';
  }

  protected resetAlert(): void {
    this.alert = undefined;
  }

  protected setAlert(type: string, message: string): boolean {
    this.alert = { 'type': type, 'message': message };
    return (type === 'success');
  }

  startSliding(nrOfChildPlaces: number, winnersOrLosers: number) {
    const maxNrOfPlaces = this.calcMaxNrOfPlacesPerPoule(this.round, winnersOrLosers);
    this.getStructureService().setMaxNrOfPoulePlacesForChildRound(maxNrOfPlaces);
  }

  protected calcMaxNrOfPlacesPerPoule(parentRound: Round, winnersOrLosers: number): number {
    const nrOfChildRoundPlaces = parentRound.getNrOfPlacesChildRound(winnersOrLosers);
    const childRound = parentRound.getChildRound(winnersOrLosers);
    if (childRound === undefined) {
      return 2;
    }
    const structureService = this.getStructureService();
    return structureService.getNrOfPlacesPerPoule(nrOfChildRoundPlaces, childRound.getPoules().length);
  }

  public onSliderChange(nrOfChildPlacesNew: number, winnersOrLosers: number) {
    // console.log('start change' );
    if ((nrOfChildPlacesNew + this.round.getNrOfPlacesChildRound(Round.getOpposing(winnersOrLosers))) > this.round.getNrOfPlaces()) {
      return;
    }
    this.getStructureService().changeNrOfPlacesChildRound(nrOfChildPlacesNew, this.round, winnersOrLosers);
    // this.getPlanningService().create(this.round.getNumber());
    if (this.round.getNumber().hasNext()) {
      this.roundNumberChanged.emit(this.round.getNumber().getNext());
    }
    // console.log('end change' );
  }

  endSliding(nrOfChildPlaces: number, winnersOrLosers: number) {
    this.checkRoundWithOnePoulePlace(nrOfChildPlaces, winnersOrLosers);
  }

  checkRoundWithOnePoulePlace(nrOfPoulePlacesChildRound: number, winnersOrLosers: number) {
    if (nrOfPoulePlacesChildRound !== 1 || this.round.getNrOfPlacesChildRound(winnersOrLosers) !== 1) {
      return;
    }
    const nextRoundNumber = this.round.getNumber().getNext();
    this.getStructureService().removeChildRound(this.round, winnersOrLosers);
    this.roundNumberChanged.emit(nextRoundNumber);
  }

  canChangeQualifyOrder(): boolean {
    return !this.round.hasCustomQualifyOrder() &&
      this.round.getPoules().length >= 2 /*&& (this.round.getNumber().getRounds().length - 1) <= 1*/;
  }

  toggleQualifyOrder(round: Round) {
    this.resetAlert();
    round.setQualifyOrder(this.qualifyOrderIsCross(round) ? Round.QUALIFYORDER_RANK : Round.QUALIFYORDER_CROSS);
    this.getStructureService().recalculateQualifyRulesForRound(round);
    // this.getPlanningService().create(round.getNumber());
    this.roundNumberChanged.emit(round.getNumber());
  }

  qualifyOrderIsCross(round: Round) {
    return round.getQualifyOrder() === Round.QUALIFYORDER_CROSS;
  }

  getDivisionClasses(round: Round): string {
    const nrOfRounds = round.getNumber().getRounds().length;
    let classes = '';
    if (nrOfRounds > 2) {
      classes += 'more-than-two-rounds';
    }
    if (nrOfRounds > 4) {
      classes += ' more-than-four-rounds';
    }
    if (nrOfRounds > 8) {
      classes += ' more-than-eight-rounds';
    }
    return classes;
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PoulePlace, Round, RoundNumber, StructureNameService, StructureService } from 'ngx-sport';

import { Tournament } from '../../tournament';

@Component({
  selector: 'app-tournament-structureround',
  templateUrl: './round.component.html',
  styleUrls: ['./round.component.css']
})
export class TournamentStructureRoundComponent {

  @Input() round: Round;
  @Output() roundNumberChanged = new EventEmitter<RoundNumber>();
  public alert: any;
  public sliderValueDummy = 3;

  uiSliderConfig: any = {
    behaviour: 'drag',
    margin: 1,
    step: 1,
    tooltips: [true]
  };

  constructor(public nameService: StructureNameService) {
    this.resetAlert();
  }

  get RoundWINNERS(): number {
    return Round.WINNERS;
  }

  get RoundLOSERS(): number {
    return Round.LOSERS;
  }

  get CustomQualifyOrder(): number {
    return Round.ORDER_CUSTOM;
  }

  private getStructureService(): StructureService {
    return new StructureService({ min: Tournament.MINNROFCOMPETITORS, max: Tournament.MAXNROFCOMPETITORS });
  }

  getWinnersLosersName(winnersOrLosers: number): string {
    return winnersOrLosers === Round.WINNERS ? 'winners' : 'losers';
  }

  getWinnersLosersDescription(winnersOrLosers: number): string {
    return Round.getWinnersLosersDescription(winnersOrLosers, true);
  }

  addPoule(round, fillPouleToMinimum = true): void {
    this.resetAlert();
    const structureService = this.getStructureService();
    structureService.addPoule(round, fillPouleToMinimum);
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
    return this.round.getPoulePlaces().length - this.round.getNrOfPlacesChildRound(opposing);
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

  public onSliderChange(nrOfChildPlacesNew: number, winnersOrLosers: number) {
    this.getStructureService().changeNrOfPlacesChildRound(nrOfChildPlacesNew, this.round, winnersOrLosers);
    // this.getPlanningService().create(this.round.getNumber());
    if ( this.round.getNumber().hasNext() ) {
      this.roundNumberChanged.emit(this.round.getNumber().getNext());
    }
  }


  toggleQualifyOrder(round: Round) {
    this.resetAlert();
    if (!(round.getNumberAsValue() === 2 || round.getNumberAsValue() === 3)) {
      return;
    }
    round.setQualifyOrder(this.qualifyOrderIsHorizontal(round) ? Round.ORDER_VERTICAL : Round.ORDER_HORIZONTAL);
    this.getStructureService().recalculateQualifyRulesForRound(round);
    // this.getPlanningService().create(round.getNumber());
    this.roundNumberChanged.emit(round.getNumber());
  }

  qualifyOrderIsHorizontal(round: Round) {
    return round.getQualifyOrder() === Round.ORDER_HORIZONTAL;
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

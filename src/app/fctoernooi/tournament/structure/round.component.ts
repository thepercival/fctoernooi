import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PoulePlace, QualifyService, Round, StructureNameService, StructureService } from 'ngx-sport';

@Component({
  selector: 'app-tournament-structureround',
  templateUrl: './round.component.html',
  styleUrls: ['./round.component.css']
})
export class TournamentStructureRoundComponent {

  @Input() round: Round;
  @Input() structureService: StructureService;
  @Output() roundChanged = new EventEmitter<number>();
  public alert: any;
  public winnersAndLosers: number[];
  public sliderValueDummy = 3;

  uiSliderConfig: any = {
    behaviour: 'drag',
    margin: 1,
    step: 1,
    tooltips: [true]
  };

  constructor(public nameService: StructureNameService) {
    this.winnersAndLosers = [Round.WINNERS, Round.LOSERS];
    this.resetAlert();
  }

  get CustomQualifyOrder(): number {
    return Round.ORDER_CUSTOM;
  }

  // private getPlanningService(): PlanningService {
  //   return new PlanningService(this.structureService);
  // }

  getWinnersLosersName(winnersOrLosers: number): string {
    return winnersOrLosers === Round.WINNERS ? 'winners' : 'losers';
  }

  getWinnersLosersDescription(winnersOrLosers: number): string {
    return Round.getWinnersLosersDescription(winnersOrLosers, true);
  }

  addPoule(round, fillPouleToMinimum = true): void {
    this.resetAlert();
    this.structureService.addPoule(round, fillPouleToMinimum);
    if (round.getNumber() > 1) {
      const qualifyService = new QualifyService(round);
      qualifyService.removeObjectsForParentRound();
      qualifyService.createObjectsForParentRound();
    }
    // this.getPlanningService().create(round.getNumber());
    this.roundChanged.emit(round.getNumber());
  }


  removePoule(round): void {
    this.resetAlert();
    try {
      this.structureService.removePoule(round);
      // this.getPlanningService().create(round.getNumber());
      this.roundChanged.emit(round.getNumber());
    } catch (e) {
      this.setAlert('danger', e.message);
    }
  }

  addPoulePlace(round): void {
    this.resetAlert();
    try {
      this.structureService.addPoulePlace(round);
      if (round.getNumber() > 1) {
        const qualifyService = new QualifyService(round);
        qualifyService.removeObjectsForParentRound();
        qualifyService.createObjectsForParentRound();
      }
      // this.getPlanningService().create(round.getNumber());
      this.roundChanged.emit(round.getNumber());
    } catch (e) {
      this.setAlert('danger', e.message);
    }
  }

  removePoulePlace(round): void {
    this.resetAlert();
    try {
      this.structureService.removePoulePlace(round);
      // this.getPlanningService().create(round.getNumber());
      this.roundChanged.emit(round.getNumber());
    } catch (e) {
      this.setAlert('danger', e.message);
    }
  }

  canRemovePoulePlace(round: Round) {
    let nrOfPoulePlaces = round.getPoulePlaces().length;
    round.getChildRounds().forEach(function (childRound) {
      nrOfPoulePlaces -= childRound.getPoulePlaces().length;
    });
    return (nrOfPoulePlaces > 0);
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
      return 'bg-warning text-white';
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
    this.structureService.changeNrOfPlacesChildRound(nrOfChildPlacesNew, this.round, winnersOrLosers);
    // this.getPlanningService().create(this.round.getNumber());
    this.roundChanged.emit(this.round.getNumber() + 1);
  }

  toggleQualifyOrder(round: Round) {
    this.resetAlert();
    if (!(round.getNumber() === 2 || round.getNumber() === 3)) {
      return;
    }
    round.setQualifyOrder(this.qualifyOrderIsHorizontal(round) ? Round.ORDER_VERTICAL : Round.ORDER_HORIZONTAL);
    const qualifyService = new QualifyService(round);
    qualifyService.removeObjectsForParentRound();
    qualifyService.createObjectsForParentRound();
    // this.getPlanningService().create(round.getNumber());
    this.roundChanged.emit(round.getNumber());
  }

  qualifyOrderIsHorizontal(round: Round) {
    return round.getQualifyOrder() === Round.ORDER_HORIZONTAL;
  }
}

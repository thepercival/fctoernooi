import { Component, EventEmitter, Input, Output } from '@angular/core';
import { QualifyService, PlanningService, PoulePlace, Round, StructureService } from 'ngx-sport';

@Component({
  selector: 'app-tournament-structureround',
  templateUrl: './round.component.html',
  styleUrls: ['./round.component.css']
})
export class TournamentStructureRoundComponent {

  @Input() round: Round;
  @Input() structureService: StructureService;
  @Output() roundChanged = new EventEmitter<Round>();
  public alert: any;
  public winnersAndLosers: number[];
  public sliderValueDummy = 3;

  uiSliderConfig: any = {
    behaviour: 'drag',
    margin: 1,
    step: 1,
    tooltips: [true]
  };

  constructor() {
    this.winnersAndLosers = [Round.WINNERS, Round.LOSERS];
    this.resetAlert();
  }

  private getPlanningService(): PlanningService {
    return new PlanningService(this.structureService);
  }

  getWinnersLosersName(winnersOrLosers: number): string {
    return winnersOrLosers === Round.WINNERS ? 'winners' : 'losers';
  }

  getWinnersLosersDescription(winnersOrLosers: number): string {
    const description = this.structureService.getWinnersLosersDescription(winnersOrLosers);
    return (description !== '' ? description + 's' : description);
  }

  addPoule(round, fillPouleToMinimum = true): void {
    this.resetAlert();
    this.structureService.addPoule(round, fillPouleToMinimum);
    if (round.getNumber() > 1) {
      const qualifyService = new QualifyService(round);
      qualifyService.removeObjectsForParentRound();
      qualifyService.createObjectsForParentRound();
    }
    this.getPlanningService().create(round.getNumber());
    this.roundChanged.emit();
  }

  removePoule(round): void {
    this.resetAlert();
    try {
      this.structureService.removePoule(round);
      this.getPlanningService().create(round.getNumber());
      this.roundChanged.emit();
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

      this.getPlanningService().create(round.getNumber());
      this.roundChanged.emit();
    } catch (e) {
      this.setAlert('danger', e.message);
    }
  }

  removePoulePlace(round): void {
    this.resetAlert();
    try {
      this.structureService.removePoulePlace(round);
      this.getPlanningService().create(round.getNumber());
      this.roundChanged.emit();
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

  getClassesForPoulePlace(poulePlace: PoulePlace): string {
    const rules = poulePlace.getToQualifyRules();
    if (rules.length === 2) {
      return 'bg-warning text-white';
    } else if (rules.length === 1) {
      const qualifyRule = rules[0];
      const singleColor = this.getClassPostfix(qualifyRule.getWinnersOrLosers());
      const bgClass = 'bg-' + (qualifyRule.getFromPoulePlaces().length === qualifyRule.getToPoulePlaces().length ? singleColor : 'warning');
      return bgClass + ' ' + 'text-white';
    }
    return 'bg-not-qualifying';
  }

  protected resetAlert(): void {
    this.alert = undefined;
  }

  protected setAlert(type: string, message: string): boolean {
    this.alert = { 'type': type, 'message': message };
    return (type === 'success');
  }

  public closeAlert(name: string) {
    this.alert = undefined;
  }

  public onSliderChange(nrOfChildPlacesNew: number, winnersOrLosers: number) {
    this.structureService.changeNrOfPlacesChildRound(nrOfChildPlacesNew, this.round, winnersOrLosers);
    this.getPlanningService().create(this.round.getNumber());
    this.roundChanged.emit();
  }

}

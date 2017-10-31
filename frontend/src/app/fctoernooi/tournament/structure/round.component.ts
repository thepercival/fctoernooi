import { Component, Input } from '@angular/core';
import { Tournament } from '../../tournament';
import { StructureService } from 'voetbaljs/structure/service';
import { PoulePlace } from 'voetbaljs/pouleplace';
import { Poule } from 'voetbaljs/poule';
import { Round } from 'voetbaljs/round';
import { QualifyRule } from 'voetbaljs/qualifyrule';

@Component({
  selector: 'app-tournament-structureround',
  templateUrl: './round.component.html',
  styleUrls: ['./round.component.css']
})
export class TournamentStructureRoundComponent {

  @Input() round: Round;
  @Input() structureService: StructureService;
  public alert: any;
  public winnersAndLosers: number[];
  public sliderValueDummy = 3;

  uiSliderConfig: any = {
    behaviour: 'drag',
    margin: 1,
    step: 1,
    tooltips: [ true ]
  };

  constructor() {
      this.winnersAndLosers = [Round.WINNERS, Round.LOSERS];
      this.resetAlert();
  }

  getWinnersLosersName( winnersOrLosers: number ): string {
    return winnersOrLosers === Round.WINNERS ? 'winners' : 'losers';
  }

  getWinnersLosersDescription( winnersOrLosers: number ): string {
    const description = this.structureService.getWinnersLosersDescription( winnersOrLosers );
    return ( description !== '' ? description + 's' : description );
  }

  addPoule( round, fillPouleToMinimum = true ): void {
    this.resetAlert();
    this.structureService.addPoule( round, fillPouleToMinimum );
  }

  removePoule( round ): void {
    this.resetAlert();
    try {
      this.structureService.removePoule(round);
    } catch (e) {
      this.setAlert( 'danger', e.message );
    }
  }

  addPoulePlace( round ): void {
    this.resetAlert();
    try {
      this.structureService.addPoulePlace(round);
    } catch (e) {
      this.setAlert( 'danger', e.message );
    }
  }

  canRemovePoulePlace(round: Round ){
    let nrOfPoulePlaces = round.getPoulePlaces().length;
    round.getChildRounds().forEach( function( childRound ) {
      nrOfPoulePlaces -= childRound.getPoulePlaces().length;
    });
    return ( nrOfPoulePlaces > 0 );
  }

  removePoulePlace( round ): void {
    this.resetAlert();
    try {
      this.structureService.removePoulePlace(round);
    } catch (e) {
      this.setAlert( 'danger', e.message );
    }
  }

  getMaxSliderValue( winnersOrLosers: number ): number {
    const opposing = Round.getOpposing( winnersOrLosers );
    return this.round.getPoulePlaces().length - this.round.getNrOfPlacesChildRound( opposing );
  }

  getClassPostfix( winnersOrLosers: number): string {
    return winnersOrLosers === Round.WINNERS ? 'success' : ( winnersOrLosers === Round.LOSERS ? 'danger' : '');
  }

  getClassPostfixPoulePlace( poulePlace: PoulePlace): string {
    const rules = poulePlace.getToQualifyRules();
    if ( rules.length === 2 ) {
      return 'warning';
    } else if ( rules.length === 1 ) {
      const qualifyRule = rules[0];
      const singleColor = this.getClassPostfix( qualifyRule.getWinnersOrLosers() );
      return qualifyRule.getFromPoulePlaces().length === qualifyRule.getToPoulePlaces().length ? singleColor : 'warning';
    }
    return 'not-qualifying';
  }


  protected resetAlert(): void {
    this.alert = null;
  }

  protected setAlert( type: string, message: string ): boolean {
    this.alert = { 'type': type, 'message': message };
    return ( type === 'success' );
  }

  public closeAlert( name: string) {
    this.alert = null;
  }

  public onSliderChange( nrOfChildPlacesNew: number, winnersOrLosers: number ) {
    this.structureService.changeNrOfPlacesChildRound( nrOfChildPlacesNew, this.round, winnersOrLosers );
  }


}

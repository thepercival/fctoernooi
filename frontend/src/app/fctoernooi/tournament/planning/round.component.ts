import { Component, Input } from '@angular/core';
import { Tournament } from '../../tournament';
import { StructureService } from 'voetbaljs/structure/service';
import { PoulePlace } from 'voetbaljs/pouleplace';
import { Poule } from 'voetbaljs/poule';
import { Round } from 'voetbaljs/round';
import { QualifyRule } from 'voetbaljs/qualifyrule';

@Component({
  selector: 'app-tournament-planninground',
  templateUrl: './round.component.html',
  styleUrls: ['./round.component.css']
})
export class TournamentPlanningRoundComponent {

  @Input() tournament: Tournament;
  @Input() round: Round;
  @Input() structureService: StructureService;
  public alert: any;
  // public winnersAndLosers: number[];

  constructor() {
      // this.winnersAndLosers = [Round.WINNERS, Round.LOSERS];
      this.resetAlert();
  }

  getWinnersLosersDescription( winnersOrLosers: number ): string {
    const description = this.structureService.getWinnersLosersDescription( winnersOrLosers );
    return ( description !== '' ? description + 's' : description );
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


}

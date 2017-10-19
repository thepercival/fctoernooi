import { Component, Input } from '@angular/core';
import { Tournament } from '../../tournament';
import { StructureService } from 'voetbaljs/structure/service';
import { PoulePlace } from 'voetbaljs/pouleplace';
import { Poule } from 'voetbaljs/poule';
import { Round } from 'voetbaljs/round';
import { QualifyService } from 'voetbaljs/qualifyrule/service';

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
    return winnersOrLosers === Round.WINNERS ? 'winnaars' : 'verliezers';
  }

  getSliderValue( winnersOrLosers: number ): number {
    const childRound = this.round.getChildRound( winnersOrLosers );
    return childRound != null ? childRound.getPoulePlaces().length : 0;
  }

  getMaxSliderValue( winnersOrLosers: number ): number {
    const opposing = winnersOrLosers === Round.WINNERS ? Round.LOSERS : Round.WINNERS;
    return this.round.getPoulePlaces().length - this.getSliderValue( opposing );
  }

  getClassPostfix( poulePlace: PoulePlace): string {
    const rule = poulePlace.getToQualifyRule();
    if ( rule == null ) {
      return 'not-qualifying';
    }
    const singleColor = rule.getWinnersOrLosers() === 1 ? 'success' : 'danger';
    return rule.getFromPoulePlaces().length === rule.getToPoulePlaces().length ? singleColor : 'warning';
  }

  addPoule( round ): void {
    this.resetAlert();
    const poules = round.getPoules();
    const places = round.getPoulePlaces();
    const nrOfPlacesNotEvenOld = places.length % poules.length;
    const placesPerPouleOld = ( places.length - nrOfPlacesNotEvenOld ) / poules.length;
    const newPoule = new Poule( round );
    const nrOfPlacesNotEven = places.length % poules.length;
    let placesToAddToNewPoule = ( places.length - nrOfPlacesNotEven ) / poules.length;

    if ( placesPerPouleOld === 2 && nrOfPlacesNotEvenOld < 2 ) {
      placesToAddToNewPoule = nrOfPlacesNotEvenOld;
    }

    const orderedByPlace = true;
    const poulePlacesOrderedByPlace = round.getPoulePlaces( orderedByPlace );
    while ( placesToAddToNewPoule > 0 ) {

      poulePlacesOrderedByPlace.forEach( function ( poulePlaceIt ) {
        if ( poulePlaceIt.getNumber() === 1 || placesToAddToNewPoule === 0 ) {
          return;
        }
        round.movePoulePlace( poulePlaceIt, newPoule );
        placesToAddToNewPoule--;
      });
    }

    // there could be a place left in the last placenumber which does not start at the first poule
    const poulePlacesPerNumberParentRound = round.getPoulePlacesPerNumber();
    const lastPoulePlaces = poulePlacesPerNumberParentRound.pop();
    let pouleIt = round.getPoules()[0];
    lastPoulePlaces.forEach( function ( lastPoulePlaceIt ) {
      if ( lastPoulePlaceIt.getPoule() !== pouleIt ) {
        round.movePoulePlace( lastPoulePlaceIt, pouleIt );
      }
      pouleIt = pouleIt.next();
    });

    while ( newPoule.getPlaces().length < 2 ) {
      const pouleTmp = new PoulePlace( newPoule );
    }

    round.getChildRounds().forEach( function ( childRound ) {
      const qualifyService = new QualifyService( childRound );
      qualifyService.removeObjectsForParentRound();
      qualifyService.createObjectsForParentRound();
    });
  }

  removePoule( round ): boolean {
    this.resetAlert();
    const poules = round.getPoules();
    const roundPlaces = round.getPoulePlaces();
    if ( poules.length === 1 ) {
      return this.setAlert( 'danger', 'er moet minimaal 1 poule zijn' );
    }
    const lastPoule = poules[poules.length - 1];
    const places = lastPoule.getPlaces();
    while ( places.length > 0 ) {
      const place = places[places.length - 1];
      const nrOfPlacesNotEven = ( ( roundPlaces.length - lastPoule.getPlaces().length ) % ( poules.length - 1 ) ) + 1;
      const poule = poules.find( pouleIt => nrOfPlacesNotEven === pouleIt.getNumber() );
      if ( !round.movePoulePlace( place, poule ) ) {
        return this.setAlert( 'danger', 'de pouleplek kan niet verplaatst worden' );
      }
    }
    try {
      this.structureService.removePoule( lastPoule );
    } catch (e) {
      return this.setAlert( 'danger', 'er moet minimaal 1 poule zijn' );
    }

    round.getChildRounds().forEach( function ( childRound ) {
      const qualifyService = new QualifyService( childRound );
      qualifyService.removeObjectsForParentRound();
      qualifyService.createObjectsForParentRound();
    });
    return true;
  }

  removePoulePlace( round ): boolean {
    this.resetAlert();
    const places = round.getPoulePlaces();
    const poules = round.getPoules();
    if ( poules.length === 0 ) {
      return this.setAlert( 'danger', 'er moet minimaal 1 poule aanwezig zijn' );
    }

    const nrOfPlacesNotEven = places.length % poules.length;
    let pouleToRemoveFrom = poules[poules.length - 1];
    if ( nrOfPlacesNotEven > 0 ) {
      pouleToRemoveFrom = poules.find( pouleIt => nrOfPlacesNotEven === pouleIt.getNumber() );
    }

    const placesTmp = pouleToRemoveFrom.getPlaces();
    const minNrOfCompetitors = round.getNumber() === 1 ? Tournament.MINNROFCOMPETITORS : Tournament.MINNROFCOMPETITORS - 1;
    if ( minNrOfCompetitors && placesTmp.length === minNrOfCompetitors ) {
      return this.setAlert( 'danger', 'er moeten minimaal ' + minNrOfCompetitors + ' deelnemers per poule zijn' );
    }
    return pouleToRemoveFrom.removePlace( placesTmp[placesTmp.length - 1]);
  }

  addPoulePlace( round ): boolean {
    this.resetAlert();
    const poules = round.getPoules();
    if ( poules.length === 0 ) {
      return this.setAlert( 'danger', 'er moet minimaal 1 poule aanwezig zijn' );
    }
    const places = round.getPoulePlaces();
    if ( places.length > Tournament.MAXNROFCOMPETITORS ) {
      return this.setAlert( 'danger', 'er mogen maximaal ' + Tournament.MAXNROFCOMPETITORS + ' deelnemers meedoen' );
    }

    const nrOfPlacesNotEven = places.length % poules.length;

    let pouleToAddTo = poules[0];
    if ( nrOfPlacesNotEven > 0 ) {
      pouleToAddTo = poules.find( pouleIt => ( nrOfPlacesNotEven + 1 ) === pouleIt.getNumber() );
    }

    const poulePlace = new PoulePlace( pouleToAddTo );
    return true;
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

  public onSliderChange( newNrOfQualifiers: number, parentRound: Round, winnersOrLosers: number ) {
    let childRound = parentRound.getChildRound( winnersOrLosers );
    console.log(childRound);
    if ( childRound == null && newNrOfQualifiers > 0 ) {
      childRound = this.structureService.addRound( parentRound, winnersOrLosers );
    }

    const qualifyService = new QualifyService( childRound );
    qualifyService.removeObjectsForParentRound();

    if ( newNrOfQualifiers === 0 ) {
      const index = parentRound.getChildRounds().indexOf( childRound );
      if (index > -1) {
        parentRound.getChildRounds().splice(index, 1);
      }
      return;
    }

    // check wat the last number was
    const nrOfPlacesDifference = newNrOfQualifiers - childRound.getPoulePlaces().length;
    if ( nrOfPlacesDifference < 0 ) {
      for ( let nI = 0 ; nI > nrOfPlacesDifference ; nI-- ) {
        if ( this.removePoulePlace( childRound ) !== true ) {
          return;
        }
      }
    } else {
      for ( let nI = 0 ; nI < nrOfPlacesDifference ; nI++ ) {
        if ( this.addPoulePlace( childRound ) !== true ) {
          return;
        }
      }
    }
    qualifyService.createObjectsForParentRound();
  }
}

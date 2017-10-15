import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TournamentRepository } from '../repository';
import { Tournament } from '../../tournament';
import { TournamentComponent } from '../component';
import { RoundRepository } from 'voetbaljs/round/repository';
import { PoulePlace } from 'voetbaljs/pouleplace';
import { Poule } from 'voetbaljs/poule';
import { Round } from 'voetbaljs/round';

@Component({
  selector: 'app-tournament-structure',
  templateUrl: './structure.component.html',
  styleUrls: ['./structure.component.css']
})
export class TournamentStructureComponent extends TournamentComponent {

  @Input()
  public alerts: any = {};
  public someValue = 0;

  someRange2config: any = {
    behaviour: 'drag',
    margin: 1,
    range: {
      min: 0,
      max: 20
    },
    step: 1,
    tooltips: [ true ]
  };

  constructor(
      route: ActivatedRoute,
      router: Router,
      tournamentRepository: TournamentRepository,
      roundRepository: RoundRepository
  ) {
      super( route, router, tournamentRepository, roundRepository );
      this.resetAlerts();
  }

  getClassPostfix( poulePlace: PoulePlace): string {
    return poulePlace.getNumber() === 1 ? 'success' : 'not-qualifying';
  }

  removePoule( round ): void {
    this.resetAlerts();
    const poules = round.getPoules();
    if ( poules.length === 1 ) {
      return this.setAlert( 'firstround', 'danger', 'er moet minimaal 1 poule zijn' );
    }
    const lastPoule = poules[poules.length - 1];
    try {
      this.structureService.removePoule( lastPoule );
    } catch (e) {
      return this.setAlert( 'firstround', 'danger', 'er moet minimaal 1 poule zijn' );
    }
  }

  addPoule( round ): void {
    this.resetAlerts();
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

    while ( placesToAddToNewPoule > 0 ) {
      for (let i = poules.length - 2 ; i >= 0 ; i-- ) {
        const pouleIt = poules[i];
        if ( pouleIt.getNumber() > nrOfPlacesNotEvenOld && placesToAddToNewPoule < pouleIt.getNumber() ) {
          continue;
        }
        const placesIt = pouleIt.getPlaces();
        const placeIt = placesIt[placesIt.length - 1];
        // console.log('moved place from poule ' + place.getPoule().getNumber());
        round.movePoulePlace(placeIt, newPoule, 1);
        placesToAddToNewPoule--;
        if ( placesToAddToNewPoule === 0 ) {
          break;
        }
      }
    }

    while ( newPoule.getPlaces().length < 2 ) {
      const poulePlace = new PoulePlace( newPoule );
    }
  }

  removePoulePlace( round ): void {
    this.resetAlerts();
    const places = round.getPoulePlaces();
    const poules = round.getPoules();
    if ( poules.length === 0 ) {
      return this.setAlert( 'firstround', 'danger', 'er moet minimaal 1 poule aanwezig zijn' );
    }

    const nrOfPlacesNotEven = places.length % poules.length;
    let pouleToRemoveFrom = poules[poules.length - 1];
    if ( nrOfPlacesNotEven > 0 ) {
      pouleToRemoveFrom = poules.find( pouleIt => nrOfPlacesNotEven === pouleIt.getNumber() );
    }

    const placesTmp = pouleToRemoveFrom.getPlaces();
    if ( placesTmp.length === Tournament.MINNROFCOMPETITORS ) {
      return this.setAlert( 'firstround', 'danger', 'er moeten minimaal ' + Tournament.MINNROFCOMPETITORS + ' deelnemers per poule zijn' );
    }
    pouleToRemoveFrom.removePlace( placesTmp[placesTmp.length - 1]);
  }

  addPoulePlace( round ): void {
    this.resetAlerts();
    const poules = round.getPoules();
    if ( poules.length === 0 ) {
      return this.setAlert( 'firstround', 'danger', 'er moet minimaal 1 poule aanwezig zijn' );
    }
    const places = round.getPoulePlaces();
    if ( places.length > Tournament.MAXNROFCOMPETITORS ) {
      return this.setAlert( 'firstround', 'danger', 'er mogen maximaal ' + Tournament.MAXNROFCOMPETITORS + ' deelnemers meedoen' );
    }

    const nrOfPlacesNotEven = places.length % poules.length;

    let pouleToAddTo = poules[0];
    if ( nrOfPlacesNotEven > 0 ) {
      pouleToAddTo = poules.find( pouleIt => ( nrOfPlacesNotEven + 1 ) === pouleIt.getNumber() );
    }

    const poulePlace = new PoulePlace( pouleToAddTo );
  }

  protected resetAlerts(): void {
    this.alerts.firstround = null;
    this.alerts.qualify = null;
  }

  protected setAlert( name: string, type: string, message: string ): void {
    this.alerts[name] = { 'type': type, 'message': message };
  }

  public closeAlert( name: string) {
    this.alerts[name] = null;
  }

  public onSliderChange( event, fromRound: Round ) {
      console.log(fromRound);
      // this.structureService.addQualifier( fromRound );
  }
}

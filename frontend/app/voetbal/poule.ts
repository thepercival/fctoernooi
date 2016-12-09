/**
 * Created by cdunnink on 7-12-2016.
 */

import {VoetbalInterface} from './interface';
import {Round} from './round';
import {PoulePlace} from './pouleplace';

export class Poule implements VoetbalInterface {
    number: number;
    round: Round;
    places: PoulePlace[] = [];

    constructor(
        round: Round
    ) {
        this.round = round;
        this.number = round.poules.length + 1;
    }

    addPlace(): PoulePlace {
        let pouleplace = new PoulePlace( this );
        this.places.push( pouleplace );
        return pouleplace;
    };

    removePlace(): void {

        // check if place is not in a qualifyrule


    };
}

/**
 * Created by cdunnink on 7-12-2016.
 */

import {VoetbalInterface} from './interface';
import {Poule} from './poule';
import {Participant} from './participant';

export class PoulePlace implements VoetbalInterface {
    number: number;
    poule: Poule;
    participant: Participant = null;
    fromQualifyRule = null;
    toQualifyRule = null;

    constructor(
        poule: Poule
    ) {
        this.poule = poule;
        this.number = poule.places.length + 1;
    }
}


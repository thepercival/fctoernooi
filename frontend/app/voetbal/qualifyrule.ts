/**
 * Created by cdunnink on 9-12-2016.
 */

import {VoetbalInterface} from './interface';
import {Round} from './round';
import {PoulePlace} from './pouleplace';

export class QualifyRule implements VoetbalInterface{
    fromRound: Round;
    toRound: Round;
    // config: any;
    fromPoulePlaces: PoulePlace[] = [];
    toPoulePlaces: PoulePlace[] = [];

    constructor(
        fromRound: Round, toRound: Round
    ) {
        this.fromRound = fromRound;
        this.toRound = toRound;
    }
}

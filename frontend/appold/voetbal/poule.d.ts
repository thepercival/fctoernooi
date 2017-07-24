/**
 * Created by cdunnink on 7-12-2016.
 */
import { VoetbalInterface } from './interface';
import { Round } from './round';
import { PoulePlace } from './pouleplace';
export declare class Poule implements VoetbalInterface {
    number: number;
    round: Round;
    places: PoulePlace[];
    constructor(round: Round);
    addPlace(): PoulePlace;
    removePlace(): void;
}

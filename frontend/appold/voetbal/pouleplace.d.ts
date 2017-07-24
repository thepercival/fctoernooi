/**
 * Created by cdunnink on 7-12-2016.
 */
import { VoetbalInterface } from './interface';
import { Poule } from './poule';
import { Participant } from './participant';
export declare class PoulePlace implements VoetbalInterface {
    number: number;
    poule: Poule;
    participant: Participant;
    fromQualifyRule: any;
    toQualifyRule: any;
    constructor(poule: Poule);
}

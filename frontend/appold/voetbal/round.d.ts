/**
 * Created by cdunnink on 7-12-2016.
 */
import { VoetbalInterface } from './interface';
import { CompetitionSeason } from './competitionseason';
import { Poule } from './poule';
import { QualifyRule } from './qualifyrule';
export declare class Round implements VoetbalInterface {
    competitonSeason: CompetitionSeason;
    nr: number;
    poules: Poule[];
    fromQualifyRules: QualifyRule[];
    toQualifyRules: QualifyRule[];
    constructor(competitonSeason: CompetitionSeason);
    addPoule(nrOfParticipants: number): Poule;
    getDefaultNrOfPoules(nrOfTeams: number): number;
    getDefaultNrOfMutualGames(): number;
    getNrOfParticipants(): number;
    next(): Round;
}

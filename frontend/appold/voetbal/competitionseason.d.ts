import { VoetbalInterface } from './interface';
import { Round } from './round';
import { Participant } from './participant';
export declare class CompetitionSeason implements VoetbalInterface {
    id: number;
    name: string;
    seasonname: string;
    participants: Participant[];
    rounds: Round[];
    addRound(nrOfTeams: number, cascade: boolean): Round;
}

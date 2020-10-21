import { Competitor, CompetitorBase } from 'ngx-sport';
import { Tournament } from './tournament';

export class TournamentCompetitor extends CompetitorBase implements Competitor {
    static readonly MIN_LENGTH_NAME = 2;
    static readonly MAX_LENGTH_NAME = 30;
    static readonly MAX_LENGTH_ABBREVIATION = 7;
    static readonly MAX_LENGTH_INFO = 200;
    static readonly MAX_LENGTH_IMAGEURL = 150;

    constructor(private tournament: Tournament, pouleNr: number, placeNr: number, private name: string) {
        super(tournament.getCompetition(), pouleNr, placeNr);
        this.tournament.getCompetitors().push(this);
    }

    getName(): string {
        return this.name;
    }

    setName(name: string) {
        this.name = name;
    }
}

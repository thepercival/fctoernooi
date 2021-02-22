import { Tournament } from './tournament';
import { TournamentCompetitor } from './competitor';
import { Competitor, Identifiable } from 'ngx-sport';

export class LockerRoom extends Identifiable {
    static readonly MIN_LENGTH_NAME = 1;
    static readonly MAX_LENGTH_NAME = 6;

    protected competitors: TournamentCompetitor[] = [];

    constructor(protected tournament: Tournament, protected name: string) {
        super();
        this.tournament.getLockerRooms().push(this);
    }

    getTournament(): Tournament {
        return this.tournament;
    }

    getName(): string {
        return this.name;
    }

    setName(name: string): void {
        this.name = name;
    }

    getCompetitors(): TournamentCompetitor[] {
        return this.competitors;
    }

    hasCompetitor(competitor: TournamentCompetitor | Competitor): boolean {
        return this.competitors.some((competitorIt: Competitor) => competitorIt === competitor);
    }

    hasCompetitors(): boolean {
        return this.getCompetitors().length > 0;
    }

    setUrl(competitors: TournamentCompetitor[]): void {
        this.competitors = competitors;
    }
}

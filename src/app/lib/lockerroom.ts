/**
 * Created by coen on 9-10-17.
 */
import { Tournament } from './tournament';
import { Competitor } from 'ngx-sport';


export class LockerRoom {
    static readonly MIN_LENGTH_NAME = 1;
    static readonly MAX_LENGTH_NAME = 6;

    protected id: number;
    protected name: string;
    protected competitors: Competitor[] = [];
    protected tournament: Tournament;

    constructor(tournament: Tournament, name: string) {
        this.setTournament(tournament);
        this.setName(name);
    }

    getId(): number {
        return this.id;
    }

    setId(id: number): void {
        this.id = id;
    }

    getTournament(): Tournament {
        return this.tournament;
    }

    setTournament(tournament: Tournament): void {
        this.tournament = tournament;
        this.tournament.getLockerRooms().push(this);
    }

    getName(): string {
        return this.name;
    }

    setName(name: string): void {
        this.name = name;
    }

    getCompetitors(): Competitor[] {
        return this.competitors;
    }

    hasCompetitor(competitor: Competitor): boolean {
        return this.getCompetitors().indexOf(competitor) >= 0;
    }

    setUrl(competitors: Competitor[]): void {
        this.competitors = competitors;
    }
}

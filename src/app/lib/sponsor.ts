/**
 * Created by coen on 9-10-17.
 */
import { Tournament } from './tournament';


export class Sponsor {
    static readonly MIN_LENGTH_NAME = 2;
    static readonly MAX_LENGTH_NAME = 30;
    static readonly MAX_LENGTH_URL = 100;

    protected id: number;
    protected name: string;
    protected url: string;
    protected tournament: Tournament;

    // constructor
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
        this.tournament.getSponsors().push(this);
    }

    getName(): string {
        return this.name;
    }

    setName(name: string): void {
        this.name = name;
    }

    getUrl(): string {
        return this.url;
    }

    setUrl(url: string): void {
        this.url = url;
    }
}

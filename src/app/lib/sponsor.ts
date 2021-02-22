import { Identifiable } from 'ngx-sport';
import { Tournament } from './tournament';

export class Sponsor extends Identifiable {
    static readonly MIN_LENGTH_NAME = 2;
    static readonly MAX_LENGTH_NAME = 30;
    static readonly MAX_LENGTH_URL = 100;

    protected url: string = '';
    protected logoUrl: string = '';
    protected screenNr: number = 0;

    constructor(protected tournament: Tournament, protected name: string) {
        super();
        this.tournament.getSponsors().push(this);
    }

    getTournament(): Tournament {
        return this.tournament;
    }

    getName(): string {
        return this.name;
    }

    getUrl(): string {
        return this.url;
    }

    setUrl(url: string): void {
        this.url = url;
    }

    getLogoUrl(): string {
        return this.logoUrl;
    }

    setLogoUrl(logoUrl: string): void {
        this.logoUrl = logoUrl;
    }

    getScreenNr(): number {
        return this.screenNr;
    }

    setScreenNr(screenNr: number): void {
        this.screenNr = screenNr;
    }
}

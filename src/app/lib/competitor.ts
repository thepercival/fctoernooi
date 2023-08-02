import { Competitor, CompetitorBase, StartLocation } from 'ngx-sport';
import { Tournament } from './tournament';

export class TournamentCompetitor extends CompetitorBase implements Competitor {
    static readonly MIN_LENGTH_NAME = 2;
    static readonly MAX_LENGTH_NAME = 30;
    static readonly MIN_LENGTH_TELEPHONE = 8;
    static readonly MAX_LENGTH_TELEPHONE = 14;
    static readonly MAX_LENGTH_ABBREVIATION = 7;
    static readonly MAX_LENGTH_INFO = 200;
    static readonly MAX_LENGTH_IMAGEURL = 150;
    private hasLogoX: boolean = false;
    private emailaddress: string|undefined;
    private telephone: string | undefined;    

    constructor(private tournament: Tournament, protected startLocation: StartLocation, private name: string) {
        super(tournament.getCompetition(), startLocation);
        this.tournament.getCompetitors().push(this);
    }

    getName(): string {
        return this.name;
    }

    setName(name: string) {
        this.name = name;
    }

    getEmailaddress(): string|undefined {
        return this.emailaddress;
    }

    setEmailaddress(emailaddress: string|undefined) {
        this.emailaddress = emailaddress;
    }

    getTelephone(): string | undefined {
        return this.telephone;
    }

    setTelephone(telephone: string|undefined) {
        this.telephone = telephone;
    }

    setLogo() {
        this.hasLogoX = true;
    }

    hasLogo(): boolean {
        return this.hasLogoX;
    }



    updateStartLocation(pouleNr: number, placeNr: number): void {
        this.startLocation = new StartLocation(this.startLocation.getCategoryNr(), pouleNr, placeNr);
    }
}

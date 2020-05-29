import { Tournament } from '../tournament';
import { TournamentAuthorization } from './authorization';

export class TournamentInvitation extends TournamentAuthorization {

    constructor(tournament: Tournament, private emailaddress: string, roles?: number) {
        super(tournament, roles ? roles : 0);
    }

    getEmailaddress(): string {
        return this.emailaddress;
    }
}

import { Role } from '../role';
import { Tournament } from '../tournament';
import { TournamentAuthorization } from './authorization';

export class TournamentInvitation extends TournamentAuthorization {

    constructor(tournament: Tournament, private emailaddress: string, roles: Role[] = []) {
        super(tournament, roles);
    }

    getEmailaddress(): string {
        return this.emailaddress;
    }
}

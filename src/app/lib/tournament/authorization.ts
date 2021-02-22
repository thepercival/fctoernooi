import { Identifiable } from 'ngx-sport';
import { Tournament } from '../tournament';

export class TournamentAuthorization extends Identifiable {

    constructor(private tournament: Tournament, protected roles: number) {
        super();
    }

    getTournament(): Tournament {
        return this.tournament;
    }

    getRoles(): number {
        return this.roles;
    }

    setRoles(roles: number) {
        this.roles = roles;
    }

    hasRoles(roles: number): boolean {
        return (this.roles & roles) === roles;
    }

    hasARole(roles: number): boolean {
        return (this.roles & roles) > 0;
    }
}

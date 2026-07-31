import { Identifiable } from 'ngx-sport';
import { Tournament } from '../tournament';
import { Role } from '../role';

export abstract class TournamentAuthorization extends Identifiable {

    protected constructor(private tournament: Tournament, protected roles: Role[]) {
        super();
    }

    getTournament(): Tournament {
        return this.tournament;
    }

    getRoles(): Role[] {
        return this.roles;
    }

    addRole(role: Role) {
        if (!this.roles.includes(role)) {
            this.roles.push(role);
            return true;
        }
        return false;
    }

    removeRole(role: Role): boolean {
        const index = this.roles.indexOf(role);
        if (index !== -1) {
            this.roles.splice(index, 1);
            return true;
        }
        return false;
    }

    emptyRoles() {
        this.roles = [];
    }

    hasRole(role: Role): boolean {
        return this.roles.includes(role);
    }
}

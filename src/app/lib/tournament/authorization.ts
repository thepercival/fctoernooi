import { Tournament } from '../tournament';

export class TournamentAuthorization {
    protected id: number;

    constructor(private tournament: Tournament, protected roles: number) {
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

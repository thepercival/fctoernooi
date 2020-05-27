import { Tournament } from '../tournament';

/**
 * Created by coen on 9-10-17.
 */

export class TournamentInvitation {
    protected id: number;
    protected roles: number;

    constructor(private tournament: Tournament, private emailaddress: string, roles?: number) {
        if (roles === undefined) {
            roles = 0;
        }
        this.roles = roles;;
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

    getEmailaddress(): string {
        return this.emailaddress;
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

import { Tournament } from './tournament';
import { User } from './user';

/**
 * Created by coen on 9-10-17.
 */

export class TournamentUser {
    protected id: number;
    protected roles: number;

    constructor(private tournament: Tournament, private user: User, roles?: number) {
        if (roles === undefined) {
            roles = 0;
        }
        this.roles = roles;;
        tournament.getUsers().push(this);
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

    getUser(): User {
        return this.user;
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

import { Competition } from 'ngx-sport';

import { TournamentRole } from './tournament/role';

/**
 * Created by coen on 9-10-17.
 */

export class Tournament {
    static readonly MINNROFCOMPETITORS = 2;
    static readonly MAXNROFCOMPETITORS = 32;

    protected id: number;
    protected competition: Competition;
    protected roles: TournamentRole[] = [];

    // constructor
    constructor(competition: Competition) {
        this.setCompetition(competition);
    }

    getId(): number {
        return this.id;
    }

    setId(id: number): void {
        this.id = id;
    }

    getCompetition(): Competition {
        return this.competition;
    }

    setCompetition(competition: Competition): void {
        this.competition = competition;
    }

    getRoles(): TournamentRole[] {
        return this.roles;
    }

    setRoles(roles: TournamentRole[]): void {
        this.roles = roles;
    }

    hasRole(userId: number, role: number) {
        return (this.getRoles().find(function (roleIt: TournamentRole) {
            return (roleIt.getUser().getId() === userId && roleIt.getRole() === TournamentRole.ADMIN);
        }) !== undefined);
    }

    getName(): string {
        return this.getCompetition().getLeague().getName();
    }
}

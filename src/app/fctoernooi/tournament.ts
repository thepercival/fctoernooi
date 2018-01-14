/**
 * Created by coen on 9-10-17.
 */
import { Competitionseason } from 'ngx-sport';

import { TournamentRole } from './tournament/role';


export class Tournament {
    static readonly MINNROFCOMPETITORS = 2;
    static readonly MAXNROFCOMPETITORS = 32;

    protected id: number;
    protected competitionseason: Competitionseason;
    protected roles: TournamentRole[] = [];

    // constructor
    constructor(competitionseason: Competitionseason) {
        this.setCompetitionseason(competitionseason);
    }

    getId(): number {
        return this.id;
    }

    setId(id: number): void {
        this.id = id;
    }

    getCompetitionseason(): Competitionseason {
        return this.competitionseason;
    }

    setCompetitionseason(competitionseason: Competitionseason): void {
        this.competitionseason = competitionseason;
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
        return this.getCompetitionseason().getCompetition().getName();
    }
}
/**
 * Created by coen on 9-10-17.
 */

import { Competitionseason } from 'voetbaljs/competitionseason';
import { TournamentRole } from './tournament/role';

export class Tournament {
    protected id: number;
    protected competitionseason: Competitionseason;
    protected roles: TournamentRole[] = [];

    static readonly MINNROFCOMPETITORS = 2;
    static readonly MAXNROFCOMPETITORS = 64;

    // constructor
    constructor( competitionseason: Competitionseason ) {
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
}

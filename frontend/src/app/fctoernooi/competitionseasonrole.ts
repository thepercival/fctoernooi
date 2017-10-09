/**
 * Created by coen on 9-10-17.
 */

import { Competitionseason } from 'voetbaljs/competitionseason';

export class CompetitionseasonRole {
    protected competitionseason: Competitionseason;
    protected role: number;

    // constructor
    constructor( competitionseason: Competitionseason, role: number ) {
        this.setCompetitionseason(competitionseason);
        this.setRole(role);
    }

    getCompetitionseason(): Competitionseason {
        return this.competitionseason;
    }

    setCompetitionseason(competitionseason: Competitionseason): void {
        this.competitionseason = competitionseason;
    }

    getRole(): number {
        return this.role;
    }

    setRole(role: number): void {
        this.role = role;
    }
}

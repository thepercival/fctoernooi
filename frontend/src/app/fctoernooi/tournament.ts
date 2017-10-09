/**
 * Created by coen on 9-10-17.
 */

import { Competitionseason } from 'voetbaljs/competitionseason';
import { CompetitionseasonRole } from './competitionseasonrole';

export class Tournament {
    protected competitionseason: Competitionseason;
    protected competitionseasonRoles: [CompetitionseasonRole];

    // constructor
    constructor( competitionseason: Competitionseason, competitionseasonRoles: [CompetitionseasonRole] ) {
        this.setCompetitionseason(competitionseason);
        this.setCompetitionseasonRoles(competitionseasonRoles);
    }

    getCompetitionseason(): Competitionseason {
        return this.competitionseason;
    }

    setCompetitionseason(competitionseason: Competitionseason): void {
        this.competitionseason = competitionseason;
    }

    getCompetitionseasonRoles(): [CompetitionseasonRole] {
        return this.competitionseasonRoles;
    }

    setCompetitionseasonRoles(competitionseasonRoles: [CompetitionseasonRole]): void {
        this.competitionseasonRoles = competitionseasonRoles;
    }
}

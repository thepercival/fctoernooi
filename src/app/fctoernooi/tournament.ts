import { Competition, PlanningService } from 'ngx-sport';

import { TournamentRole } from './tournament/role';
import { Sponsor } from './tournament/sponsor';

/**
 * Created by coen on 9-10-17.
 */

export class Tournament {
    static readonly MINNROFCOMPETITORS = 2;
    static readonly MAXNROFCOMPETITORS = 36;

    protected id: number;
    protected competition: Competition;
    protected roles: TournamentRole[] = [];
    protected sponsors: Sponsor[] = [];
    protected breakStartDateTime: Date;
    protected breakDuration: number;

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

    hasRole(userId: number, roleValue: number) {
        return (this.getRoles().find(roleIt => {
            return (roleIt.getUser().getId() === userId && (roleIt.getValue() & roleValue) === roleIt.getValue());
        }) !== undefined);
    }

    getName(): string {
        return this.getCompetition().getLeague().getName();
    }

    getSponsors(): Sponsor[] {
        return this.sponsors;
    }

    setSponsors(sponsors: Sponsor[]): void {
        this.sponsors = sponsors;
    }

    getBreakStartDateTime(): Date {
        return this.breakStartDateTime;
    }

    setBreakStartDateTime(breakStartDateTime: Date): void {
        this.breakStartDateTime = breakStartDateTime;
    }

    getBreakDuration(): number {
        return this.breakDuration;
    }

    setBreakDuration(breakDuration: number): void {
        this.breakDuration = breakDuration;
    }

    hasBreak(): boolean {
        return this.breakStartDateTime !== undefined;
    }
}

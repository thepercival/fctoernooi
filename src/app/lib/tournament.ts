import { Competition, PlanningPeriod, StructureOptions } from 'ngx-sport';

import { Sponsor } from './sponsor';
import { LockerRoom } from './lockerroom';
import { User } from './user';
import { TournamentUser } from './tournament/user';

/**
 * Created by coen on 9-10-17.
 */

export class Tournament {
    static readonly StructureOptions: StructureOptions = {
        pouleRange: { min: 1, max: 16 },
        placeRange: { min: 2, max: 40 },
        placesPerPouleRange: { min: 2, max: 12 }
    };
    protected id: number;
    protected competition: Competition;
    protected users: TournamentUser[] = [];
    protected sponsors: Sponsor[] = [];
    protected lockerRooms: LockerRoom[] = [];
    protected breakStartDateTime: Date;
    protected breakEndDateTime: Date;
    protected public: boolean;
    protected updated: boolean;

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

    getUsers(): TournamentUser[] {
        return this.users;
    }

    getUser(user?: User): TournamentUser {
        if (user === undefined) {
            return undefined;
        }
        return this.getUsers().find(tournamentUser => tournamentUser.getUser() === user);
    }

    // setRoles(roles: Role[]): void {
    //     this.roles = roles;
    // }

    getName(): string {
        return this.getCompetition().getLeague().getName();
    }

    getSponsors(): Sponsor[] {
        return this.sponsors;
    }

    getLockerRooms(): LockerRoom[] {
        return this.lockerRooms;
    }

    getBreakStartDateTime(): Date {
        return this.breakStartDateTime;
    }

    setBreakStartDateTime(breakStartDateTime: Date): void {
        this.breakStartDateTime = breakStartDateTime;
    }

    getBreakEndDateTime(): Date {
        return this.breakEndDateTime;
    }

    setBreakEndDateTime(breakEndDateTime: Date): void {
        this.breakEndDateTime = breakEndDateTime;
    }

    getPublic(): boolean {
        return this.public;
    }

    setPublic(publicX: boolean): void {
        this.public = publicX;
    }

    getUpdated(): boolean {
        return this.updated;
    }

    setUpdated(updated: boolean): void {
        this.updated = updated;
    }

    hasBreak(): boolean {
        return this.breakStartDateTime !== undefined;
    }

    getBreak(): PlanningPeriod {
        if (this.getBreakStartDateTime() === undefined || this.getBreakEndDateTime() === undefined) {
            return undefined;
        }
        return { start: this.getBreakStartDateTime(), end: this.getBreakEndDateTime() };
    }
}

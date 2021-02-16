import { Competition, Period, PlaceRange } from 'ngx-sport';

import { Sponsor } from './sponsor';
import { LockerRoom } from './lockerroom';
import { User } from './user';
import { TournamentUser } from './tournament/user';
import { TournamentCompetitor } from './competitor';
import { Identifiable } from 'ngx-sport';

export class Tournament extends Identifiable {
    protected id: number;
    protected competition: Competition;
    protected users: TournamentUser[] = [];
    protected sponsors: Sponsor[] = [];
    protected competitors: TournamentCompetitor[] = [];
    protected lockerRooms: LockerRoom[] = [];
    protected breakStartDateTime: Date;
    protected breakEndDateTime: Date;
    protected public: boolean;
    protected updated: boolean;

    constructor(competition: Competition) {
        super();
        this.setCompetition(competition);
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

    getCompetitors(): TournamentCompetitor[] {
        return this.competitors;
    }

    getCompetitorNames(): string[] {
        return this.getCompetitors().map(competitor => competitor.getName());
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

    hasBreak(): boolean {
        return this.breakStartDateTime !== undefined;
    }

    getBreak(): Period {
        if (this.getBreakStartDateTime() === undefined || this.getBreakEndDateTime() === undefined) {
            return undefined;
        }
        return new Period(this.getBreakStartDateTime(), this.getBreakEndDateTime());
    }
}

import { Competition } from 'ngx-sport';

import { Sponsor } from './sponsor';
import { LockerRoom } from './lockerroom';
import { UserId } from './user';
import { TournamentUser } from './tournament/user';
import { TournamentCompetitor } from './competitor';
import { Identifiable } from 'ngx-sport';
import { Recess } from './recess';
import { StartEditMode } from './tournament/startEditMode';
import { JsonTheme } from './tournament/theme';

export class Tournament extends Identifiable {
    protected id: number = 0;
    protected intro: string = '';
    protected theme: JsonTheme|undefined;
    protected location: string|undefined;
    protected logoExtension: string | undefined;
    protected users: TournamentUser[] = [];
    protected sponsors: Sponsor[] = [];
    protected competitors: TournamentCompetitor[] = [];
    protected lockerRooms: LockerRoom[] = [];
    protected recesses: Recess[] = [];
    protected public: boolean = false;

    constructor(protected competition: Competition, protected startEditMode: StartEditMode) {
        super();
    }

    getCompetition(): Competition {
        return this.competition;
    }

    getUsers(): TournamentUser[] {
        return this.users;
    }

    getUser(userId: UserId): TournamentUser | undefined {
        return this.getUsers().find(tournamentUser => tournamentUser.getUserId().getId() === userId.getId());
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

    getRecesses(): Recess[] {
        return this.recesses;
    }

    getPublic(): boolean {
        return this.public;
    }

    setPublic(publicX: boolean): void {
        this.public = publicX;
    }

    getStartEditMode(): StartEditMode {
        return this.startEditMode;
    }

    getIntro(): string {
        return this.intro;
    }

    setIntro(intro: string): void {
        this.intro = intro;
    }

    getTheme(): JsonTheme | undefined {
        return this.theme;
    }

    setTheme(theme: JsonTheme): void {
        this.theme = theme;
    }

    getLocation(): string | undefined {
        return this.location;
    }

    setLocation(location: string | undefined): void {
        this.location = location;
    }

    hasLocation(): boolean {
        return this.location !== undefined ? this.location.length > 0 : false;
    }

    getLogoExtension(): string | undefined {
        return this.logoExtension;
    }

    setLogoExtension(logoExtension: string | undefined): void {
        this.logoExtension = logoExtension;
    }

    hasLogoExtension(): boolean {
        return this.logoExtension !== undefined ? this.logoExtension.length > 0 : false;
    }
}

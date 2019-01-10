import { Tournament } from './tournament';
import { User } from './user';

/**
 * Created by coen on 9-10-17.
 */

export class Role {
    static readonly ADMIN = 1;
    static readonly STRUCTUREADMIN = 2;
    static readonly PLANNER = 4;
    static readonly GAMERESULTADMIN = 8;
    static readonly REFEREE = 16;
    static readonly ALL = 31;

    protected id: number;
    protected tournament: Tournament;
    protected user: User;
    protected value: number;

    // constructor
    constructor(tournament: Tournament, user: User, value: number) {
        this.setTournament(tournament);
        this.setUser(user);
        this.setValue(value);
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

    setTournament(tournament: Tournament): void {
        this.tournament = tournament;
    }

    getUser(): User {
        return this.user;
    }

    setUser(user: User): void {
        this.user = user;
    }

    getValue(): number {
        return this.value;
    }

    setValue(value: number): void {
        this.value = value;
    }
}

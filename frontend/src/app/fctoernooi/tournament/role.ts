/**
 * Created by coen on 9-10-17.
 */

import { Tournament } from '../tournament';
import { User } from '../../user/user';

export class TournamentRole {
    protected id: number;
    protected tournament: Tournament;
    protected user: User;
    protected role: number;

    // constructor
    constructor( tournament: Tournament, user: User, role: number ) {
        this.setTournament(tournament);
        this.setUser(user);
        this.setRole(role);
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

    getRole(): number {
        return this.role;
    }

    setRole(role: number): void {
        this.role = role;
    }
}

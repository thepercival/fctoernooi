

import { TournamentAuthorization } from './authorization';
import { Tournament } from '../tournament';
import { User } from '../user';

export class TournamentUser extends TournamentAuthorization {

    constructor(tournament: Tournament, private user: User, roles?: number) {
        super(tournament, roles ? roles : 0);
        tournament.getUsers().push(this);
    }

    getUser(): User {
        return this.user;
    }
}



import { TournamentAuthorization } from './authorization';
import { Tournament } from '../tournament';
import { UserId } from '../user';
import { Role } from '../role';

export class TournamentUser extends TournamentAuthorization {

    constructor(tournament: Tournament, private userId: UserId, roles: Role[]) {
        super(tournament, roles);
        tournament.getUsers().push(this);
    }

    getUserId(): UserId {
        return this.userId;
    }
}

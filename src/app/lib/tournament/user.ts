

import { TournamentAuthorization } from './authorization';
import { Tournament } from '../tournament';
import { UserId } from '../user';

export class TournamentUser extends TournamentAuthorization {

    constructor(tournament: Tournament, private userId: UserId, roles?: number) {
        super(tournament, roles ? roles : 0);
        tournament.getUsers().push(this);
    }

    getUserId(): UserId {
        return this.userId;
    }
}

import { Injectable } from '@angular/core';
import { JsonIdentifiable } from 'ngx-sport';

import { Tournament } from '../../tournament';
import { UserId } from '../../user';
import { TournamentUser } from '../user';
import { JsonTournamentUser } from './json';

@Injectable({
    providedIn: 'root'
})
export class TournamentUserMapper {
    constructor() { }

    toObject(json: JsonTournamentUser, tournament: Tournament, tournamentUser?: TournamentUser): TournamentUser {
        if (tournamentUser === undefined) {
            tournamentUser = new TournamentUser(tournament, new UserId(+json.user.id));
        }
        tournamentUser.setId(json.id);
        tournamentUser.setRoles(json.roles);
        return tournamentUser;
    }

    toJson(tournamentUser: TournamentUser): JsonTournamentUser {
        return {
            id: tournamentUser.getId(),
            user: { id: tournamentUser.getUserId().getId() },
            roles: tournamentUser.getRoles()
        };
    }
}



import { Injectable } from '@angular/core';
import { JsonIdentifiable } from 'ngx-sport';

import { Tournament } from '../../tournament';
import { JsonUser, UserMapper } from '../../user/mapper';
import { TournamentUser } from '../user';

@Injectable({
    providedIn: 'root'
})
export class TournamentUserMapper {
    constructor(private userMapper: UserMapper) { }

    toObject(json: JsonTournamentUser, tournament: Tournament, tournamentUser?: TournamentUser): TournamentUser {
        if (tournamentUser === undefined) {
            const user = this.userMapper.toObject(json.user);
            tournamentUser = new TournamentUser(tournament, user);
        }
        tournamentUser.setId(json.id);
        tournamentUser.setRoles(json.roles);
        return tournamentUser;
    }

    toJson(tournamentUser: TournamentUser): JsonTournamentUser {
        return {
            id: tournamentUser.getId(),
            user: this.userMapper.toJson(tournamentUser.getUser()),
            roles: tournamentUser.getRoles()
        };
    }
}

export interface JsonTournamentUser extends JsonIdentifiable {
    user: JsonUser;
    roles: number;
}

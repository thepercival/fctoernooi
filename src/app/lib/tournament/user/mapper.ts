import { Injectable } from '@angular/core';
import { JsonIdentifiable } from 'ngx-sport';

import { Tournament } from '../../tournament';
import { UserId } from '../../user';
import { TournamentUser } from '../user';
import { JsonTournamentUser } from './json';
import { Role } from '../../role';
import { RoleMapper } from '../authorization/roleMapper';

@Injectable({
    providedIn: 'root'
})
export class TournamentUserMapper {
    constructor(private roleMapper: RoleMapper) { }

    toObject(json: JsonTournamentUser, tournament: Tournament, tournamentUser?: TournamentUser): TournamentUser {
        const roles = this.roleMapper.mapNumberToRoles(json.roles);
        if (tournamentUser === undefined) {
            tournamentUser = new TournamentUser(tournament, new UserId(+json.user.id), roles);
        }
        else {
            tournamentUser.emptyRoles();
            for (const role of roles) {
                tournamentUser.addRole(role);
            }
        }
        tournamentUser.setId(json.id);
        
        return tournamentUser;
    }

    toJson(tournamentUser: TournamentUser): JsonTournamentUser {
        return {
            id: tournamentUser.getId(),
            user: { id: tournamentUser.getUserId().getId() },
            roles: this.roleMapper.mapRolesToNumber(tournamentUser.getRoles())
        };
    }
}



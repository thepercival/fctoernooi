import { Injectable, inject } from '@angular/core';

import { Tournament } from '../../tournament';
import { JsonIdentifiable } from 'ngx-sport';
import { TournamentInvitation } from '../invitation';
import { RoleMapper } from '../authorization/roleMapper';
import { JsonTournamentInvitation } from './json';

@Injectable({
    providedIn: 'root'
})
export class TournamentInvitationMapper {
    private roleMapper = inject(RoleMapper);
    constructor() { }

    toObject(json: JsonTournamentInvitation, tournament: Tournament): TournamentInvitation {
        const invitation = new TournamentInvitation(tournament, json.emailaddress, this.roleMapper.mapNumberToRoles(json.roles));
        invitation.setId(json.id);
        return invitation;
    }

    toJson(invitation: TournamentInvitation): JsonTournamentInvitation {
        return {
            id: invitation.getId(),
            emailaddress: invitation.getEmailaddress(),
            roles: this.roleMapper.mapRolesToNumber(invitation.getRoles())
        };
    }
}

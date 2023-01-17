import { Injectable } from '@angular/core';

import { Tournament } from '../../tournament';
import { JsonIdentifiable } from 'ngx-sport';
import { TournamentInvitation } from '../invitation';

@Injectable({
    providedIn: 'root'
})
export class TournamentInvitationMapper {
    constructor() { }

    toObject(json: JsonTournamentInvitation, tournament: Tournament): TournamentInvitation {
        const invitation = new TournamentInvitation(tournament, json.emailaddress, json.roles);
        invitation.setId(json.id);
        return invitation;
    }

    toJson(invitation: TournamentInvitation): JsonTournamentInvitation {
        return {
            id: invitation.getId(),
            emailaddress: invitation.getEmailaddress(),
            roles: invitation.getRoles()
        };
    }
}

export interface JsonTournamentInvitation extends JsonIdentifiable {
    emailaddress: string;
    roles: number;
}

import { Injectable } from '@angular/core';
import { CompetitionMapper, JsonCompetition } from 'ngx-sport';

import { JsonRole, RoleMapper } from '../role/mapper';
import { JsonSponsor, SponsorMapper } from '../sponsor/mapper';
import { Tournament } from '../tournament';

@Injectable()
export class TournamentMapper {
    constructor(
        private csMapper: CompetitionMapper,
        private roleMapper: RoleMapper,
        private sponsorMapper: SponsorMapper) { }

    toObject(json: JsonTournament): Tournament {
        const competition = this.csMapper.toObject(json.competition);
        const tournament = new Tournament(competition);
        const roles = json.roles.map(jsonRole => this.roleMapper.toObject(jsonRole, tournament));
        json.sponsors.map(jsonSponsor => this.sponsorMapper.toObject(jsonSponsor, tournament));
        tournament.setRoles(roles);
        tournament.setId(json.id);
        if (json.breakStartDateTime !== undefined) {
            tournament.setBreakStartDateTime(new Date(json.breakStartDateTime));
        }
        tournament.setBreakDuration(json.breakDuration);
        return tournament;
    }

    toJson(tournament: Tournament): JsonTournament {
        return {
            id: tournament.getId(),
            competition: this.csMapper.toJson(tournament.getCompetition()),
            roles: tournament.getRoles().map(role => this.roleMapper.toJson(role)),
            sponsors: tournament.getSponsors().map(sponsor => this.sponsorMapper.toJson(sponsor)),
            breakStartDateTime: tournament.getBreakStartDateTime() ? tournament.getBreakStartDateTime().toISOString() : undefined,
            breakDuration: tournament.getBreakDuration(),
        };
    }
}

export interface JsonTournament {
    id?: number;
    competition: JsonCompetition;
    breakStartDateTime?: string;
    breakDuration?: number;
    roles: JsonRole[];
    sponsors: JsonSponsor[];
}
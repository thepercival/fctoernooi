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
        const jsonRoles = json.roles !== undefined ? json.roles : [];
        const roles = jsonRoles.map(jsonRole => this.roleMapper.toObject(jsonRole, tournament));
        json.sponsors.map(jsonSponsor => this.sponsorMapper.toObject(jsonSponsor, tournament));
        tournament.setRoles(roles);
        tournament.setId(json.id);
        if (json.breakStartDateTime !== undefined) {
            tournament.setBreakStartDateTime(new Date(json.breakStartDateTime));
        }
        if (json.breakEndDateTime !== undefined) {
            tournament.setBreakEndDateTime(new Date(json.breakEndDateTime));
        }
        tournament.setPublic(json.public);
        tournament.setUpdated(json.updated);
        return tournament;
    }

    toJson(tournament: Tournament): JsonTournament {
        return {
            id: tournament.getId(),
            competition: this.csMapper.toJson(tournament.getCompetition()),
            roles: tournament.getRoles().map(role => this.roleMapper.toJson(role)),
            sponsors: tournament.getSponsors().map(sponsor => this.sponsorMapper.toJson(sponsor)),
            breakStartDateTime: tournament.getBreakStartDateTime() ? tournament.getBreakStartDateTime().toISOString() : undefined,
            breakEndDateTime: tournament.getBreakEndDateTime() ? tournament.getBreakEndDateTime().toISOString() : undefined,
            public: tournament.getPublic(),
            updated: tournament.getUpdated()
        };
    }
}

export interface JsonTournament {
    id?: number;
    competition: JsonCompetition;
    breakStartDateTime?: string;
    breakEndDateTime?: string;
    public: boolean;
    roles: JsonRole[];
    sponsors: JsonSponsor[];
    updated: boolean;
}

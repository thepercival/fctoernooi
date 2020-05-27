import { Injectable } from '@angular/core';
import { CompetitionMapper, JsonCompetition } from 'ngx-sport';

import { TournamentUserMapper, JsonTournamentUser } from '../tournamentuser/mapper';
import { JsonSponsor, SponsorMapper } from '../sponsor/mapper';
import { Tournament } from '../tournament';
import { JsonLockerRoom, LockerRoomMapper } from '../lockerroom/mapper';

@Injectable()
export class TournamentMapper {
    constructor(
        private competitionMapper: CompetitionMapper,
        private tournamentUserMapper: TournamentUserMapper,
        private sponsorMapper: SponsorMapper,
        private lockerRoomMapper: LockerRoomMapper) { }

    toObject(json: JsonTournament): Tournament {
        const competition = this.competitionMapper.toObject(json.competition);
        const tournament = new Tournament(competition);
        if (json.users) {
            json.users.map(jsonUser => this.tournamentUserMapper.toObject(jsonUser, tournament));
        }
        json.sponsors.map(jsonSponsor => this.sponsorMapper.toObject(jsonSponsor, tournament));
        json.lockerRooms.map(jsonLockerRoom => this.lockerRoomMapper.toObject(jsonLockerRoom, tournament));
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
            competition: this.competitionMapper.toJson(tournament.getCompetition()),
            users: tournament.getUsers().map(tournamentUser => this.tournamentUserMapper.toJson(tournamentUser)),
            lockerRooms: tournament.getLockerRooms().map(lockerRoom => this.lockerRoomMapper.toJson(lockerRoom)),
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
    users: JsonTournamentUser[];
    lockerRooms: JsonLockerRoom[];
    sponsors: JsonSponsor[];
    updated: boolean;
}

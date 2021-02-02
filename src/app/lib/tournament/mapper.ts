import { Injectable } from '@angular/core';
import { CompetitionMapper } from 'ngx-sport';

import { TournamentUserMapper } from './user/mapper';
import { SponsorMapper } from '../sponsor/mapper';
import { Tournament } from '../tournament';
import { LockerRoomMapper } from '../lockerroom/mapper';
import { JsonTournament } from './json';
import { CompetitorMapper } from '../competitor/mapper';

@Injectable({
    providedIn: 'root'
})
export class TournamentMapper {
    constructor(
        private competitionMapper: CompetitionMapper,
        private tournamentUserMapper: TournamentUserMapper,
        private sponsorMapper: SponsorMapper,
        private competitorMapper: CompetitorMapper,
        private lockerRoomMapper: LockerRoomMapper) { }

    toObject(json: JsonTournament): Tournament {
        const competition = this.competitionMapper.toObject(json.competition);
        const tournament = new Tournament(competition);
        if (json.users) {
            json.users.map(jsonUser => this.tournamentUserMapper.toObject(jsonUser, tournament));
        }
        json.sponsors.map(jsonSponsor => this.sponsorMapper.toObject(jsonSponsor, tournament));
        json.competitors.map(jsonCompetitor => this.competitorMapper.toObject(jsonCompetitor, tournament));
        json.lockerRooms.map(jsonLockerRoom => this.lockerRoomMapper.toObject(jsonLockerRoom, tournament));
        tournament.setId(json.id);
        if (json.breakStartDateTime !== undefined) {
            tournament.setBreakStartDateTime(new Date(json.breakStartDateTime));
        }
        if (json.breakEndDateTime !== undefined) {
            tournament.setBreakEndDateTime(new Date(json.breakEndDateTime));
        }
        tournament.setPublic(json.public);
        return tournament;
    }

    toJson(tournament: Tournament): JsonTournament {
        return {
            id: tournament.getId(),
            competition: this.competitionMapper.toJson(tournament.getCompetition()),
            users: tournament.getUsers().map(tournamentUser => this.tournamentUserMapper.toJson(tournamentUser)),
            competitors: tournament.getCompetitors().map(competitor => this.competitorMapper.toJson(competitor)),
            lockerRooms: tournament.getLockerRooms().map(lockerRoom => this.lockerRoomMapper.toJson(lockerRoom)),
            sponsors: tournament.getSponsors().map(sponsor => this.sponsorMapper.toJson(sponsor)),
            breakStartDateTime: tournament.getBreakStartDateTime() ? tournament.getBreakStartDateTime().toISOString() : undefined,
            breakEndDateTime: tournament.getBreakEndDateTime() ? tournament.getBreakEndDateTime().toISOString() : undefined,
            public: tournament.getPublic()
        };
    }
}

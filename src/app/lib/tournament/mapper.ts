import { Injectable } from '@angular/core';
import { CompetitionMapper, JsonPeriod, Period } from 'ngx-sport';

import { TournamentUserMapper } from './user/mapper';
import { SponsorMapper } from '../sponsor/mapper';
import { Tournament } from '../tournament';
import { LockerRoomMapper } from '../lockerroom/mapper';
import { JsonTournament } from './json';
import { Recess } from '../recess';
import { RecessMapper } from '../recess/mapper';
import { TournamentCompetitorMapper } from '../competitor/mapper';

@Injectable({
    providedIn: 'root'
})
export class TournamentMapper {
    constructor(
        private competitionMapper: CompetitionMapper,
        private tournamentUserMapper: TournamentUserMapper,
        private sponsorMapper: SponsorMapper,
        private competitorMapper: TournamentCompetitorMapper,
        private lockerRoomMapper: LockerRoomMapper,
        private recessMapper: RecessMapper) { }

    toObject(json: JsonTournament): Tournament {
        const competition = this.competitionMapper.toObject(json.competition);
        const tournament = new Tournament(competition, json.startEditMode);
        tournament.setLogoExtension(json.logoExtension);
        if (json.intro) {
            tournament.setIntro(json.intro);
        }
        if (json.theme) {
            tournament.setTheme(json.theme);
        }
        if (json.location) {
            tournament.setLocation(json.location);
        }
        if (json.users) {
            json.users.map(jsonUser => this.tournamentUserMapper.toObject(jsonUser, tournament));
        }
        json.sponsors.map(jsonSponsor => this.sponsorMapper.toObject(jsonSponsor, tournament));
        json.competitors.map(jsonCompetitor => this.competitorMapper.toObject(jsonCompetitor, tournament));
        json.lockerRooms.map(jsonLockerRoom => this.lockerRoomMapper.toObject(jsonLockerRoom, tournament));
        json.recesses.map(jsonRecess => this.recessMapper.toObject(jsonRecess, tournament));
        tournament.setId(json.id);
        tournament.setPublic(json.public);
        return tournament;
    }

    toJson(tournament: Tournament): JsonTournament {
        return {
            id: tournament.getId(),
            intro: tournament.getIntro(),
            theme: tournament.getTheme(),
            logoExtension: tournament.getLogoExtension(),
            location: tournament.getLocation(),
            competition: this.competitionMapper.toJson(tournament.getCompetition()),
            users: tournament.getUsers().map(tournamentUser => this.tournamentUserMapper.toJson(tournamentUser)),
            competitors: tournament.getCompetitors().map(competitor => this.competitorMapper.toJson(competitor)),
            lockerRooms: tournament.getLockerRooms().map(lockerRoom => this.lockerRoomMapper.toJson(lockerRoom)),
            recesses: tournament.getRecesses().map(recess => this.recessMapper.toJson(recess)),
            sponsors: tournament.getSponsors().map(sponsor => this.sponsorMapper.toJson(sponsor)),
            public: tournament.getPublic(),
            startEditMode: tournament.getStartEditMode()
        };
    }
}

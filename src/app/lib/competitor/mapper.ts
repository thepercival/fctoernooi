import { Injectable } from '@angular/core';

import { Tournament } from '../tournament';
import { TournamentCompetitor } from '../competitor';
import { StartLocation } from 'ngx-sport';
import { JsonTournamentCompetitor } from './json';

@Injectable({
    providedIn: 'root'
})
export class TournamentCompetitorMapper {
    constructor() { }

    toObject(json: JsonTournamentCompetitor, tournament: Tournament, competitor?: TournamentCompetitor): TournamentCompetitor {
        if (competitor === undefined) {
            const startLocation = new StartLocation(json.categoryNr, json.pouleNr, json.placeNr);
            competitor = new TournamentCompetitor(tournament, startLocation, json.name);
        }
        competitor.setId(json.id);
        return this.updateObject(json, competitor);
    }

    updateObject(json: JsonTournamentCompetitor, competitor: TournamentCompetitor): TournamentCompetitor {
        if (json.registered !== undefined) { competitor.setRegistered(json.registered) };
        if (json.info !== undefined) { competitor.setInfo(json.info) };
        competitor.setEmailaddress(json.emailaddress);
        competitor.setTelephone(json.telephone);
        return competitor;
    }

    toJson(competitor: TournamentCompetitor): JsonTournamentCompetitor {
        return {
            id: competitor.getId(),
            registered: competitor.getRegistered(),
            hasLogo: competitor.hasLogo(),
            info: competitor.getInfo(),
            name: competitor.getName(),
            emailaddress: competitor.getEmailaddress(),
            telephone: competitor.getTelephone(),
            categoryNr: competitor.getStartLocation().getCategoryNr(),
            pouleNr: competitor.getStartLocation().getPouleNr(),
            placeNr: competitor.getStartLocation().getPlaceNr()
        };
    }
}
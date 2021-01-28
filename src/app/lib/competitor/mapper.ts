import { Injectable } from '@angular/core';

import { Tournament } from '../tournament';
import { TournamentCompetitor } from '../competitor';
import { Competitor, JsonCompetitor } from 'ngx-sport';

@Injectable({
    providedIn: 'root'
})
export class CompetitorMapper {
    constructor() { }

    toObject(json: JsonCompetitor, tournament: Tournament, competitor?: TournamentCompetitor): TournamentCompetitor {
        if (competitor === undefined) {
            competitor = new TournamentCompetitor(tournament, json.pouleNr, json.placeNr, json.name);
        }
        competitor.setId(json.id);
        this.updateObject(json, competitor);
        return competitor;
    }

    updateObject(json: JsonCompetitor, competitor: TournamentCompetitor) {
        competitor.setRegistered(json.registered);
        competitor.setInfo(json.info);
    }

    toJson(competitor: Competitor): JsonCompetitor {
        return {
            id: competitor.getId(),
            registered: competitor.getRegistered(),
            info: competitor.getInfo(),
            name: competitor.getName(),
            pouleNr: competitor.getPouleNr(),
            placeNr: competitor.getPlaceNr()
        };
    }
}
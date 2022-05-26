import { Injectable } from '@angular/core';

import { Tournament } from '../tournament';
import { TournamentCompetitor } from '../competitor';
import { Competitor, JsonCompetitor, StartLocation } from 'ngx-sport';

@Injectable({
    providedIn: 'root'
})
export class CompetitorMapper {
    constructor() { }

    toObject(json: JsonCompetitor, tournament: Tournament, competitor?: TournamentCompetitor): TournamentCompetitor {
        if (competitor === undefined) {
            const startLocation = new StartLocation(json.categoryNr, json.pouleNr, json.placeNr);
            competitor = new TournamentCompetitor(tournament, startLocation, json.name);
        }
        competitor.setId(json.id);
        return this.updateObject(json, competitor);
    }

    updateObject(json: JsonCompetitor, competitor: TournamentCompetitor): TournamentCompetitor {
        if (json.registered !== undefined) { competitor.setRegistered(json.registered) };
        if (json.info !== undefined) { competitor.setInfo(json.info) };
        return competitor;
    }

    toJson(competitor: TournamentCompetitor): JsonCompetitor {
        return {
            id: competitor.getId(),
            registered: competitor.getRegistered(),
            info: competitor.getInfo(),
            name: competitor.getName(),
            categoryNr: competitor.getStartLocation().getCategoryNr(),
            pouleNr: competitor.getStartLocation().getPouleNr(),
            placeNr: competitor.getStartLocation().getPlaceNr()
        };
    }
}
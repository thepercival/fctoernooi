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
        if (json.present !== undefined) { competitor.setPresent(json.present) };
        if (json.publicInfo !== undefined) { competitor.setPublicInfo(json.publicInfo) };
        if (json.privateInfo !== undefined) { competitor.setPrivateInfo(json.privateInfo) };
        competitor.setEmailaddress(json.emailaddress);
        competitor.setTelephone(json.telephone);
        competitor.setLogoExtension(json.logoExtension);
        return competitor;
    }

    toJson(competitor: TournamentCompetitor): JsonTournamentCompetitor {
        return {
            id: competitor.getId(),
            present: competitor.getPresent(),
            logoExtension: competitor.getLogoExtension(),
            publicInfo: competitor.getPublicInfo(),
            privateInfo: competitor.getPrivateInfo(),
            name: competitor.getName(),
            emailaddress: competitor.getEmailaddress(),
            telephone: competitor.getTelephone(),
            categoryNr: competitor.getStartLocation().getCategoryNr(),
            pouleNr: competitor.getStartLocation().getPouleNr(),
            placeNr: competitor.getStartLocation().getPlaceNr()
        };
    }
}
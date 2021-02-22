import { Injectable } from '@angular/core';

import { Sponsor } from '../sponsor';
import { Tournament } from '../tournament';
import { JsonSponsor } from './json';

@Injectable({
    providedIn: 'root'
})
export class SponsorMapper {
    constructor() { }

    toObject(json: JsonSponsor, tournament: Tournament, sponsor?: Sponsor): Sponsor {
        if (sponsor === undefined) {
            sponsor = new Sponsor(tournament, json.name);
        }
        sponsor.setId(json.id);
        if (json.url) { sponsor.setUrl(json.url) };
        if (json.logoUrl) { sponsor.setLogoUrl(json.logoUrl) };
        if (json.screenNr) { sponsor.setScreenNr(json.screenNr) };
        return sponsor;
    }

    toJson(sponsor: Sponsor): JsonSponsor {
        return {
            id: sponsor.getId(),
            name: sponsor.getName(),
            url: sponsor.getUrl(),
            logoUrl: sponsor.getLogoUrl(),
            screenNr: sponsor.getScreenNr()
        };
    }
}


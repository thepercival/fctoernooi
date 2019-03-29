import { Injectable } from '@angular/core';

import { Sponsor } from '../sponsor';
import { Tournament } from '../tournament';
import { UserMapper } from '../user/mapper';

/**
 * Created by coen on 10-10-17.
 */
@Injectable()
export class SponsorMapper {
    constructor(private userMapper: UserMapper) { }

    toObject(json: JsonSponsor, tournament: Tournament, sponsor?: Sponsor): Sponsor {
        if (sponsor === undefined) {
            sponsor = new Sponsor(tournament, json.name);
        }
        sponsor.setId(json.id);
        sponsor.setUrl(json.url);
        sponsor.setLogoUrl(json.logoUrl);
        return sponsor;
    }

    toJson(sponsor: Sponsor): JsonSponsor {
        return {
            id: sponsor.getId(),
            name: sponsor.getName(),
            url: sponsor.getUrl(),
            logoUrl: sponsor.getLogoUrl()
        };
    }
}

export interface JsonSponsor {
    id?: number;
    name: string;
    url?: string;
    logoUrl?: string;
}

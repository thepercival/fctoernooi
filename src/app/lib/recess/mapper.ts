import { Injectable } from '@angular/core';
import { Recess } from '../recess';

import { Tournament } from '../tournament';
import { JsonRecess } from './json';

@Injectable({
    providedIn: 'root'
})
export class RecessMapper {
    constructor() { }

    toObject(json: JsonRecess, tournament: Tournament): Recess {
        const recess = new Recess(tournament, new Date(json.start), new Date(json.end));
        recess.setId(json.id);
        return recess;
    }

    toJson(recess: Recess): JsonRecess {
        return {
            id: recess.getId(),
            start: recess.getStartDateTime().toISOString(),
            end: recess.getEndDateTime().toISOString(),
        };
    }
}


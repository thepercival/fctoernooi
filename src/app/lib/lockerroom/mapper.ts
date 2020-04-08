import { Injectable } from '@angular/core';

import { Tournament } from '../tournament';
import { CompetitorMapper } from 'ngx-sport';
import { LockerRoom } from '../lockerroom';

/**
 * Created by coen on 10-10-17.
 */
@Injectable()
export class LockerRoomMapper {
    constructor(private competitorMapper: CompetitorMapper) { }

    toObject(json: JsonLockerRoom, tournament: Tournament, lockerRoom?: LockerRoom): LockerRoom {
        if (lockerRoom === undefined) {
            lockerRoom = new LockerRoom(tournament, json.name);
        }
        lockerRoom.setId(json.id);
        const association = tournament.getCompetition().getLeague().getAssociation();
        json.competitorIds.forEach(competitorId => {
            lockerRoom.getCompetitors().push((this.competitorMapper.toObject({ id: competitorId }, association)));
        });
        return lockerRoom;
    }

    toJson(lockerRoom: LockerRoom): JsonLockerRoom {
        return {
            id: lockerRoom.getId(),
            name: lockerRoom.getName(),
            competitorIds: lockerRoom.getCompetitors().map(competitor => competitor.getId())
        };
    }
}

export interface JsonLockerRoom {
    id?: number;
    name: string;
    competitorIds: number[];
}

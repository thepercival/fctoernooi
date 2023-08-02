import { Injectable } from '@angular/core';

import { Tournament } from '../tournament';
import { LockerRoom } from '../lockerroom';
import { TournamentCompetitor } from '../competitor';
import { JsonLockerRoom } from './json';
import { TournamentCompetitorMapper } from '../competitor/mapper';

@Injectable({
    providedIn: 'root'
})
export class LockerRoomMapper {
    constructor(private competitorMapper: TournamentCompetitorMapper) { }

    toObject(json: JsonLockerRoom, tournament: Tournament, lockerRoom?: LockerRoom): LockerRoom {
        if (lockerRoom === undefined) {
            lockerRoom = new LockerRoom(tournament, json.name);
        }
        lockerRoom.setId(json.id);
        if (json.competitorIds) {
            json.competitorIds.forEach(competitorId => {
                const competitor = tournament.getCompetitors().find((competitorIt: TournamentCompetitor) => {
                    return competitorIt.getId() === competitorId;
                });
                if (lockerRoom && competitor) {
                    lockerRoom.getCompetitors().push(competitor);
                }
            });
        }
        return lockerRoom;
    }

    toJson(lockerRoom: LockerRoom): JsonLockerRoom {
        return {
            id: lockerRoom.getId(),
            name: lockerRoom.getName()
        };
    }
}

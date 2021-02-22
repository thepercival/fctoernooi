import { Injectable } from '@angular/core';

import { Tournament } from '../tournament';
import { LockerRoom } from '../lockerroom';
import { CompetitorMapper } from '../competitor/mapper';
import { TournamentCompetitor } from '../competitor';
import { JsonLockerRoom } from './json';

@Injectable({
    providedIn: 'root'
})
export class LockerRoomMapper {
    constructor(private competitorMapper: CompetitorMapper) { }

    toObject(json: JsonLockerRoom, tournament: Tournament, lockerRoom?: LockerRoom): LockerRoom {
        if (lockerRoom === undefined) {
            lockerRoom = new LockerRoom(tournament, json.name);
        }
        lockerRoom.setId(json.id);
        json.competitorIds.forEach(competitorId => {
            const competitor = tournament.getCompetitors().find((competitorIt: TournamentCompetitor) => {
                return competitorIt.getId() === competitorId;
            });
            if (lockerRoom && competitor) {
                lockerRoom.getCompetitors().push(competitor);
            }
        });
        return lockerRoom;
    }

    toJson(lockerRoom: LockerRoom): JsonLockerRoom {
        return {
            id: lockerRoom.getId(),
            name: lockerRoom.getName(),
            competitorIds: lockerRoom.getCompetitors().map(competitor => +competitor.getId())
        };
    }
}

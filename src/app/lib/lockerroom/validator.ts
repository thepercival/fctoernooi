import { LockerRoom } from '../lockerroom';
import { Competitor } from 'ngx-sport';
import { TournamentCompetitor } from '../competitor';

export class LockerRoomValidator {
    constructor(private competitors: TournamentCompetitor[], private lockerRooms: LockerRoom[]) { }

    getCompetitors(): Competitor[] {
        return this.competitors;
    }

    getLockerRooms(): LockerRoom[] {
        return this.lockerRooms;
    }

    areAllArranged(): boolean {
        return this.competitors.length > 0 && this.competitors.every(competitor => this.isArranged(competitor));
    }

    areSomeArranged(): boolean {
        return this.competitors.length > 0 && this.competitors.some(competitor => this.isArranged(competitor));
    }

    isArranged(competitor: Competitor): boolean {
        return this.lockerRooms.some(lockerRoom => lockerRoom.hasCompetitor(competitor));
    }

    isArrangedMultiple(competitor: TournamentCompetitor): boolean {
        return this.nrArranged(competitor) > 1;
    }

    nrArranged(competitor: Competitor, filterLockerRoom?: LockerRoom): number {
        return this.lockerRooms.filter(lockerRoom => {
            if (filterLockerRoom && filterLockerRoom === lockerRoom) {
                return false;
            }
            return lockerRoom.getCompetitors().some((competitorIt: Competitor) => competitorIt === competitor);
        }).length;
    }
}

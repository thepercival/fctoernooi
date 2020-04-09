import { Tournament } from '../tournament';
import { LockerRoom } from '../lockerroom';
import { Competitor } from 'ngx-sport';

export class LockerRoomValidator {
    constructor(private competitors: Competitor[], private lockerRooms: LockerRoom[]) { }

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

    isArranged(competitor): boolean {
        return this.lockerRooms.some(lockerRoom => lockerRoom.hasCompetitor(competitor));
    }

    isArrangedMultiple(competitor): boolean {
        return this.nrArranged(competitor) > 1;
    }

    nrArranged(competitor): number {
        return this.lockerRooms.filter(lockerRoom => {
            return lockerRoom.getCompetitors().indexOf(competitor) >= 0;
        }).length;
    }
}

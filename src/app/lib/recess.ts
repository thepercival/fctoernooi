import { Period } from 'ngx-sport';
import { Tournament } from './tournament';

export class Recess extends Period {
    protected id: number = 0;

    constructor(tournament: Tournament, startDateTime: Date, endDateTime: Date) {
        super(startDateTime, endDateTime);
        tournament.getRecesses().push(this);
    }

    getId(): number {
        return this.id;
    }

    setId(id: number): void {
        this.id = id;
    }
}

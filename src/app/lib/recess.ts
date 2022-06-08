import { Period } from 'ngx-sport';
import { Tournament } from './tournament';

export class Recess extends Period {
    static readonly MAX_LENGTH_NAME = 15;

    protected id: number = 0;

    constructor(tournament: Tournament, protected name: string, startDateTime: Date, endDateTime: Date) {
        super(startDateTime, endDateTime);
        tournament.getRecesses().push(this);
    }

    getId(): number {
        return this.id;
    }

    setId(id: number): void {
        this.id = id;
    }

    getName(): string {
        return this.name;
    }
}

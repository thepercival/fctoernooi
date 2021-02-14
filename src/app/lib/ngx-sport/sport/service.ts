import { Injectable } from '@angular/core';
import { Sport } from 'ngx-sport';

@Injectable({
    providedIn: 'root'
})
export class SportService {

    constructor() {
    }

    public getMaxNrOfGamePlaces(sports: Sport[]): number {
        let maxNrOfGamePlaces = 0;
        sports.forEach((sport: Sport) => {
            const nrOfGamePlaces = sport.getNrOfGamePlaces();
            if (nrOfGamePlaces > maxNrOfGamePlaces) {
                maxNrOfGamePlaces = nrOfGamePlaces;
            }
        });
        return maxNrOfGamePlaces;
    }
}

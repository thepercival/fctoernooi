import { Injectable } from '@angular/core';
import { Tournament } from '../../tournament';

@Injectable({
    providedIn: 'root'
})
export class ScreenConfigLocalBackEnd {


    protected identifier = 'screenRefreshConfigs-';

    constructor() { }

    firstTime(tournament: Tournament): boolean {
        return localStorage.getItem(this.getId(tournament)) !== null;
    }

    save(tournament: Tournament) {
        localStorage.setItem(this.getId(tournament), JSON.stringify(true));
    }

    getId(tournament: Tournament): string {
        return this.identifier + tournament.getId();
    }
}
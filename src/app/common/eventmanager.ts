import { Injectable, EventEmitter } from '@angular/core';
import { NavBarTournamentTVViewLink } from '../nav/nav.component';

@Injectable()
export class GlobalEventsManager {
    public toggleTVIconInNavBar: EventEmitter<NavBarTournamentTVViewLink> = new EventEmitter();
    // public hideTVIcon: EventEmitter<any> = new EventEmitter();
}

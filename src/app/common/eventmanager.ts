import { EventEmitter, Injectable } from '@angular/core';

import { NavBarTournamentLiveboardLink } from '../nav/nav.component';

@Injectable()
export class GlobalEventsManager {
    public toggleLiveboardIconInNavBar: EventEmitter<NavBarTournamentLiveboardLink> = new EventEmitter();
}

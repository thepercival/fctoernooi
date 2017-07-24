/**
 * Created by cdunnink on 6-12-2016.
 */

import { Injectable, EventEmitter} from "@angular/core";

@Injectable()
export class GlobalEventsManager {
    public showCompetitionSeasonDetailsInNavBar: EventEmitter<any> = new EventEmitter( false );

    constructor() {

    }
}

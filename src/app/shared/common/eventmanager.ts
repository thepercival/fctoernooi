import { EventEmitter, Injectable } from '@angular/core';
import { LiveboardLink } from '../../lib/liveboard/link';

@Injectable()
export class GlobalEventsManager {
    public toggleLiveboardIconInNavBar: EventEmitter<LiveboardLink> = new EventEmitter();
}

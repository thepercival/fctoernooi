import { EventEmitter, Injectable } from '@angular/core';
import { LiveboardLink } from '../../lib/liveboard/link';

@Injectable()
export class GlobalEventsManager {
    public toggleLiveboardIconInNavBar: EventEmitter<LiveboardLink> = new EventEmitter();
    public updateTitleInNavBar: EventEmitter<string> = new EventEmitter();
    public showFooter: EventEmitter<boolean> = new EventEmitter();
}

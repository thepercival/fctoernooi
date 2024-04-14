import { EventEmitter, Injectable } from '@angular/core';
import { LiveboardLink } from '../../lib/liveboard/link';
import { NavBarData } from '../layout/nav/nav.component';

@Injectable()
export class GlobalEventsManager {
    public toggleLiveboardIconInNavBar: EventEmitter<LiveboardLink> = new EventEmitter();
    public updateDataInNavBar: EventEmitter<NavBarData> = new EventEmitter();
    public showFooter: EventEmitter<boolean> = new EventEmitter();
}

import { Component, OnInit, Input, output } from '@angular/core';

import { LockerRoom } from '../../../lib/lockerroom';
import { LockerRoomValidator } from '../../../lib/lockerroom/validator';
import { Favorites } from '../../../lib/favorites';

@Component({
    selector: 'app-tournament-lockerroom',
    templateUrl: './lockerroom.component.html',
    styleUrls: ['./lockerroom.component.scss']
})
export class LockerRoomComponent {
    @Input() validator: LockerRoomValidator | undefined;
    @Input() lockerRoom!: LockerRoom;
    @Input() editable: boolean = false;
    @Input() favorites: Favorites | undefined;
    
    onLockerroomRemove = output<LockerRoom>();
    onLockerroomNameChange = output<LockerRoom>();
    onCompetitorsChange = output<LockerRoom>();

    constructor() {
    }

    hasCompetitors(): boolean {
        return this.lockerRoom.getCompetitors().length > 0;
    }
}

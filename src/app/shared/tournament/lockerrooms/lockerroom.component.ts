import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { LockerRoom } from '../../../lib/lockerroom';
import { LockerRoomValidator } from '../../../lib/lockerroom/validator';
import { Place } from 'ngx-sport';
import { Favorites } from '../../../lib/favorites';

@Component({
    selector: 'app-tournament-lockerroom',
    templateUrl: './lockerroom.component.html',
    styleUrls: ['./lockerroom.component.scss']
})
export class LockerRoomComponent implements OnInit {
    @Input() validator: LockerRoomValidator;
    @Input() lockerRoom: LockerRoom;
    @Input() editable: boolean;
    @Input() favorites: Favorites;
    @Output() remove = new EventEmitter<LockerRoom>();
    @Output() changeName = new EventEmitter<LockerRoom>();
    @Output() changeCompetitors = new EventEmitter<LockerRoom>();

    constructor() {
    }

    ngOnInit() {

    }

    hasCompetitors(): boolean {
        return this.lockerRoom.getCompetitors().length > 0;
    }
}

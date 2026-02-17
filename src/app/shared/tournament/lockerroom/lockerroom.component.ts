import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { LockerRoom } from '../../../lib/lockerroom';
import { LockerRoomValidator } from '../../../lib/lockerroom/validator';
import { Favorites } from '../../../lib/favorites';
import { TOURNAMENT_UI_IMPORTS } from '../tournament.ui-imports';

@Component({
    selector: 'app-tournament-lockerroom',
    templateUrl: './lockerroom.component.html',
    styleUrls: ['./lockerroom.component.scss'],
    standalone: true,
    imports: [TOURNAMENT_UI_IMPORTS],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LockerRoomComponent {
    readonly _validator = input<LockerRoomValidator | undefined>(undefined);
    readonly _lockerRoom = input.required<LockerRoom>();
    readonly _editable = input(false);
    readonly _favorites = input<Favorites | undefined>(undefined);
    
    readonly onLockerroomRemove = output<LockerRoom>();
    readonly onLockerroomNameChange = output<LockerRoom>();
    readonly onCompetitorsChange = output<LockerRoom>();

    constructor() {
    }

    hasCompetitors(): boolean {
        return this.lockerRoom.getCompetitors().length > 0;
    }

    get validator(): LockerRoomValidator | undefined {
        return this._validator();
    }

    get lockerRoom(): LockerRoom {
        return this._lockerRoom();
    }

    get editable(): boolean {
        return this._editable();
    }

    get favorites(): Favorites | undefined {
        return this._favorites();
    }
}

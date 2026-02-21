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
    public validator = input.required<LockerRoomValidator>();
    public lockerRoom = input.required<LockerRoom>();
    public editable = input(false);
    public favorites = input<Favorites | undefined>(undefined);
    
    readonly onLockerroomRemove = output<LockerRoom>();
    readonly onLockerroomNameChange = output<LockerRoom>();
    readonly onCompetitorsChange = output<LockerRoom>();

    constructor() {
    }

    hasCompetitors(): boolean {
        return this.lockerRoom().getCompetitors().length > 0;
    }
}

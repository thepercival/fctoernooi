import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Round } from 'ngx-sport';
import { TOURNAMENT_UI_IMPORTS } from '../tournament.ui-imports';

@Component({
    selector: 'app-qualifyagainstconfig-info',
    templateUrl: './info.component.html',
    styleUrls: ['./info.component.scss'],
    imports: [TOURNAMENT_UI_IMPORTS],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class AgainstQualifyInfoComponent {
    readonly _round = input.required<Round>();

    get round(): Round {
        return this._round();
    }
}

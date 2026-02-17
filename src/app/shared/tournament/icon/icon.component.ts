import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core';
import { TOURNAMENT_UI_IMPORTS } from '../tournament.ui-imports';

@Component({
    selector: 'app-tournament-icon',
    templateUrl: './icon.component.html',
    styleUrls: ['./icon.component.scss'],
    standalone: true,
    imports: [TOURNAMENT_UI_IMPORTS],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TournamentIconComponent {
    readonly name = input.required<CustomIconName>();

    get prefix(): IconPrefix { return <IconPrefix>'fac'; }
}

type CustomIconName = 'referee' | 'scoreboard' | 'soccer-field' | 'structure';
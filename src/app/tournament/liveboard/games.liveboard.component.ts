import { Component, Input } from '@angular/core';
import { Game, NameService, PlanningService } from 'ngx-sport';

import { GamesScreen, ScheduledGamesScreen } from '../../lib/liveboard/screens';

@Component({
    selector: 'app-tournament-liveboard-games',
    templateUrl: './games.liveboard.component.html',
    styleUrls: ['./games.liveboard.component.scss']
})
export class TournamentLiveboardGamesComponent {

    @Input() screen: GamesScreen;
    @Input() hasFields: boolean;
    @Input() hasReferees: boolean;
    @Input() planningService: PlanningService;

    constructor(
        public nameService: NameService
    ) {
    }

    isScheduled(): boolean {
        return this.screen instanceof ScheduledGamesScreen;
    }

    getScore(game: Game): string {
        const sScore = ' - ';
        if (game.getState() !== Game.STATE_PLAYED) {
            return sScore;
        }
        const finalScore = game.getFinalScore();
        if (finalScore === undefined) {
            return sScore;
        }
        return finalScore.getHome() + sScore + finalScore.getAway();
    }
}
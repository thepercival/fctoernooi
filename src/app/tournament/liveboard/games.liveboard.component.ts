import { Component, Input } from '@angular/core';
import { Game, NameService, PlanningService, RoundNumber } from 'ngx-sport';

import { CreatedAndInplayGamesScreen, GamesScreen } from '../../lib/liveboard/screens';

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

    isCreatedAndInplay(): boolean {
        return this.screen instanceof CreatedAndInplayGamesScreen;
    }

    showDateTime(game?: Game): boolean {
        const roundNumber = this.getRoundNumber(game);
        return this.isCreatedAndInplay()
            && roundNumber.getConfig().getEnableTime()
            && this.planningService.canCalculateStartDateTime(roundNumber);
    }

    getRoundNumber(game?: Game): RoundNumber {
        if (game === undefined) {
            game = this.screen.getGames()[0];
        }
        return game.getRound().getNumber();
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
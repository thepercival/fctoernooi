import { Component, Input } from '@angular/core';
import { Game, NameService, Round, RoundNumber, SportScoreConfigService, State } from 'ngx-sport';

import { CreatedAndInplayGamesScreen, GamesScreen } from '../../lib/liveboard/screens';

@Component({
    selector: 'app-tournament-liveboard-games',
    templateUrl: './games.liveboard.component.html',
    styleUrls: ['./games.liveboard.component.scss']
})
export class LiveboardGamesComponent {

    private sportScoreConfigService: SportScoreConfigService;

    @Input() screen: GamesScreen;
    @Input() nameService: NameService;

    constructor(
    ) {
        this.sportScoreConfigService = new SportScoreConfigService();
    }

    get GameHOME(): boolean { return Game.HOME; }
    get GameAWAY(): boolean { return Game.AWAY; }

    isCreatedAndInplay(): boolean {
        return this.screen instanceof CreatedAndInplayGamesScreen;
    }

    showDateTime(game?: Game): boolean {
        const roundNumber = this.getRoundNumber(game);
        return this.isCreatedAndInplay() && roundNumber.getValidPlanningConfig().getEnableTime();
    }

    showBatch(game?: Game): boolean {
        const roundNumber = this.getRoundNumber(game);
        return this.isCreatedAndInplay() && !roundNumber.getValidPlanningConfig().getEnableTime();
    }

    getRoundNumber(game?: Game): RoundNumber {
        if (game === undefined) {
            game = this.screen.getGames()[0];
        }
        return game.getRound().getNumber();
    }

    getScore(game: Game): string {
        const sScore = ' - ';
        if (game.getState() !== State.Finished) {
            return sScore;
        }
        const finalScore = this.sportScoreConfigService.getFinalScore(game);
        if (finalScore === undefined) {
            return sScore;
        }
        return finalScore.getHome() + sScore + finalScore.getAway();
    }

    hasReferees() {
        return this.screen.getGames().some(game => game.getReferee() !== undefined || game.getRefereePlace() !== undefined);
    }

    getRoundAbbreviation(round: Round, sameName: boolean = false) {
        const name = this.nameService.getRoundName(round);
        if (name.indexOf(' finale') >= 0) {
            return name.replace(' finale', 'F');
        } else if (name.indexOf('finale') >= 0) {
            return 'FIN';
        } else if (name.indexOf(' plaats') >= 0) {
            return name.replace(' plaats', '');
        } else if (name.indexOf(' ronde') >= 0) {
            return 'R' + name.substring(0, 1);
        }
        return name;
    }
}

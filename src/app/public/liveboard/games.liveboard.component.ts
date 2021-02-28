import { Component, Input } from '@angular/core';
import { AgainstGame, AgainstSide, NameService, Round, ScoreConfigService, State, TogetherGame } from 'ngx-sport';
import { AgainstGamePlace } from 'ngx-sport/src/game/place/against';
import { TogetherGamePlace } from 'ngx-sport/src/game/place/together';
import { DateFormatter } from '../../lib/dateFormatter';
import { GamesScreen, ResultsScreen } from '../../lib/liveboard/screens';

@Component({
    selector: 'app-tournament-liveboard-games',
    templateUrl: './games.liveboard.component.html',
    styleUrls: ['./games.liveboard.component.scss']
})
export class LiveboardGamesComponent {
    @Input() screen!: GamesScreen;
    @Input() nameService!: NameService;

    constructor(
        private scoreConfigService: ScoreConfigService,
        public dateFormatter: DateFormatter
    ) {
    }

    isResultsScreen(): boolean {
        return this.screen instanceof ResultsScreen;
    }

    get BatchViewModeNr(): BatchViewMode { return BatchViewMode.Nr }
    get BatchViewModeDate(): BatchViewMode { return BatchViewMode.Nr }

    getBatchViewMode(game: AgainstGame | TogetherGame): BatchViewMode {
        return game.getPlanningConfig().getEnableTime() ? BatchViewMode.Date : BatchViewMode.Nr;
    }

    get HomeSide(): AgainstSide { return AgainstSide.Home; }
    get AwaySide(): AgainstSide { return AgainstSide.Away; }

    getSidePlaces(game: TogetherGame | AgainstGame, side: AgainstSide): string {
        return this.nameService.getPlacesFromName((<AgainstGame>game).getSidePlaces(side), true, true)
    }

    getTogetherPlace(gamePlace: AgainstGamePlace | TogetherGamePlace): string {
        return this.nameService.getPlaceFromName(gamePlace.getPlace(), true, true)
    }

    getAgainstScore(game: TogetherGame | AgainstGame): string {
        const sScore = ' - ';
        if (game.getState() !== State.Finished) {
            return sScore;
        }
        const finalScore = this.scoreConfigService.getFinalAgainstScore(<AgainstGame>game);
        if (finalScore === undefined) {
            return sScore;
        }
        return finalScore.getHome() + sScore + finalScore.getAway();
    }

    getTogetherScore(gamePlace: TogetherGamePlace): string {
        const score = '';
        if (gamePlace.getGame().getState() !== State.Finished) {
            return score;
        }
        const finalScore = this.scoreConfigService.getFinalTogetherScore(gamePlace);
        return score + finalScore;
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

export enum BatchViewMode { Nr = 1, Date }

import { Component, Input, OnInit } from '@angular/core';
import { AgainstGame, AgainstGamePlace, AgainstSide, NameService, Round, ScoreConfigService, GameState, TogetherGame, TogetherGamePlace, AgainstVariant, StructureNameService } from 'ngx-sport';
import { DateFormatter } from '../../lib/dateFormatter';
import { ResultsScreen, ScheduleScreen } from '../../lib/liveboard/screens';

@Component({
    selector: 'app-tournament-liveboard-games',
    templateUrl: './games.liveboard.component.html',
    styleUrls: ['./games.liveboard.component.scss']
})
export class LiveboardGamesComponent implements OnInit {
    @Input() screen!: ScheduleScreen | ResultsScreen;
    @Input() structureNameService!: StructureNameService;
    public hasOnlyGameModeAgainst: boolean = true;

    constructor(
        private scoreConfigService: ScoreConfigService,
        public dateFormatter: DateFormatter
    ) {
    }

    ngOnInit() {
        this.hasOnlyGameModeAgainst = this.hasOnlyAgainstGameMode();
    }

    isResultsScreen(): boolean {
        return this.screen instanceof ResultsScreen;
    }

    isScheduleScreen(): boolean {
        return this.screen instanceof ScheduleScreen;
    }

    get BatchViewModeNr(): BatchViewMode { return BatchViewMode.Nr }
    get BatchViewModeDate(): BatchViewMode { return BatchViewMode.Date }

    getBatchViewModeHeader(screen: ScheduleScreen|ResultsScreen): BatchViewMode | undefined{
        if (screen instanceof ScheduleScreen) {
            return screen.getBatchViewModeHeader();
        }
        return undefined;
    }

    getBatchViewMode(game: AgainstGame | TogetherGame): BatchViewMode {
        return game.getPlanningConfig().getEnableTime() ? BatchViewMode.Date : BatchViewMode.Nr;
    }

    get HomeSide(): AgainstSide { return AgainstSide.Home; }
    get AwaySide(): AgainstSide { return AgainstSide.Away; }

    getSidePlaces(game: TogetherGame | AgainstGame, side: AgainstSide): string {
        return this.structureNameService.getPlacesFromName((<AgainstGame>game).getSidePlaces(side), true, true);
    }

    getAgainstScore(game: TogetherGame | AgainstGame): string {
        const sScore = ' - ';
        if (game.getState() !== GameState.Finished) {
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
        if (gamePlace.getGame().getState() !== GameState.Finished) {
            return score;
        }
        const finalScore = this.scoreConfigService.getFinalTogetherScore(gamePlace);
        return score + finalScore;
    }

    hasReferees() {
        return this.screen.getGames().some(game => game.getReferee() !== undefined || game.getRefereePlace() !== undefined);
    }

    getRefereeName(game: AgainstGame | TogetherGame, longName?: boolean): string | undefined {
        const referee = game.getReferee();
        if (referee) {
            return longName ? referee.getName() : referee.getInitials();
        }
        const refereePlace = game.getRefereePlace();
        if (refereePlace) {
            return this.structureNameService.getPlaceName(refereePlace, true, longName);
        }
        return '';
    }

    getRoundAbbreviation(round: Round, sameName: boolean = false) {
        const name = this.structureNameService.getRoundName(round);
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

    public getFirstGameStartDate(): string {
        const game: TogetherGame | AgainstGame | undefined = this.screen.getGames()[0];
        return this.dateFormatter.toString(game?.getStartDateTime(), this.dateFormatter.date())
    }

    private hasOnlyAgainstGameMode(): boolean {
        return this.screen.getGames().every((game: AgainstGame | TogetherGame): boolean => {
            return this.isAgainst(game);
        });
    }

    isAgainst(game: AgainstGame | TogetherGame): boolean {
        return game.getCompetitionSport().getVariant() instanceof AgainstVariant;
    }

    isPlayed(game: AgainstGame | TogetherGame): boolean {
        return game.getState() === GameState.Finished;
    }
}

export enum BatchViewMode { Nr = 1, Date }

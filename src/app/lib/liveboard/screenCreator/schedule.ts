import { AgainstGame, Game, GameOrder, RoundNumber, GameState, TogetherGame, CategoryMap, Category, GameGetter } from "ngx-sport";
import { BatchViewMode } from "../../../public/liveboard/games.liveboard.component";
import { ScreenConfig } from "../screenConfig/json";
import { ScheduleScreen } from "../screens";
export class ScheduleScreenCreator {

    constructor(protected screenConfig: ScreenConfig, protected maxLines: number) {
    }

    // minimal current batch and next batch
    getScreens(firstRoundNuber: RoundNumber, categories: Category[]): ScheduleScreen[] {
        const categoryMap = new CategoryMap(categories);
        const batchViewModeHeader = firstRoundNuber.getValidPlanningConfig().getEnableTime() ? BatchViewMode.Date : BatchViewMode.Nr;
        const scheduleScreen = new ScheduleScreen(this.screenConfig, this.maxLines, batchViewModeHeader);
        this.fillScreens(scheduleScreen, firstRoundNuber, categoryMap);
        if (scheduleScreen.isEmpty()) {
            return [];
        }
        const screens: ScheduleScreen[] = [];
        screens.push(scheduleScreen);
        const nextScreen = scheduleScreen.getNext();
        if (nextScreen) {
            screens.push(nextScreen);
        }
        return screens;
    }

    protected fillScreens(screen: ScheduleScreen, roundNumber: RoundNumber, categoryMap: CategoryMap) {
        const roundGames: (AgainstGame | TogetherGame)[] = (new GameGetter()).getGames(GameOrder.ByDate, roundNumber, categoryMap);

        const maxNrOfScreens = this.getNrOfScreens(roundGames);

        const batchViewModeHeader = roundNumber.getValidPlanningConfig().getEnableTime() ? BatchViewMode.Date : BatchViewMode.Nr;
        const now = new Date();
        let game: AgainstGame | TogetherGame | undefined = roundGames.shift();
        let nextGame: AgainstGame | TogetherGame | undefined = roundGames.shift();        
        while (!this.screensFilled(screen, maxNrOfScreens) && game !== undefined) {
            const start = game.getStartDateTime();
            if (game.getState() === GameState.Finished || (roundNumber.getValidPlanningConfig().getEnableTime() && start && start < now)
            ) {
                game = nextGame;
                nextGame = roundGames.shift();
                continue;
            }

            screen.addGame(game);

            if (screen.isFull() && screen.isFirst() && maxNrOfScreens > 1) {                
                screen = screen.createNext(batchViewModeHeader);
            }

            game = nextGame;
            nextGame = roundGames.shift();
        }
        const nextRoundNumber = roundNumber.getNext();
        if (nextRoundNumber && this.screensFilled(screen, maxNrOfScreens) === false) {
            this.fillScreens(screen, nextRoundNumber, categoryMap);
        }
    }

    protected screensFilled(screen: ScheduleScreen, maxNrOfScreens: number): boolean {
        if (!screen.isFull()) {
            return false;
        }
        if (screen.isFirst() && maxNrOfScreens === 2) {
            return false;
        }
        return true;
    }

    protected getNrOfScreens(roundGames: (AgainstGame | TogetherGame)[]): number {
        if (roundGames.length <= this.maxLines) {
            return 1;
        }
        let nrOfBatchGames = 0;
        const initialBatchNr = roundGames[0].getBatchNr();

        roundGames.every((game: Game) => {
            nrOfBatchGames++;
            return (initialBatchNr === game.getBatchNr());
        });
        return (nrOfBatchGames > this.maxLines) ? 2 : 1;
    }
}
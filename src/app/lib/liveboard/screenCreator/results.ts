import _ from "lodash";
import { AgainstGame, Game, GameOrder, RoundNumber, GameState, TogetherGame, Category, CategoryMap, GameGetter } from "ngx-sport";
import { BatchViewMode } from "../../../public/liveboard/games.liveboard.component";
import { ScreenConfig } from "../screenConfig/json";
import { ResultsScreen } from "../screens";

export class ResultsScreenCreator {

    constructor(protected screenConfig: ScreenConfig, protected maxLines: number) {
    }

    getScreens(lastRoundNumber: RoundNumber, categories: Category[]): ResultsScreen[] {
        return categories.map((category: Category): ResultsScreen => {
            const screen = new ResultsScreen(this.screenConfig, this.maxLines);
            this.addGames(screen, lastRoundNumber, new CategoryMap([category]));
            return screen;
        }).filter((resultsScreen: ResultsScreen): boolean => {
            return !resultsScreen.isEmpty();
        });
    }

    protected addGames(screen: ResultsScreen, roundNumber: RoundNumber, categoryMap: CategoryMap) {
        let games: (AgainstGame | TogetherGame)[] = (new GameGetter()).getGames(GameOrder.ByDate, roundNumber, categoryMap);
        games = games.reverse().filter(game => game.getState() === GameState.Finished);


        while (!screen.hasEnoughLines() && games.length > 0) {
            const game: AgainstGame | TogetherGame | undefined = games.shift();
            if (game) {
                screen.addGame(game);
            }
        }
        if (!screen.hasEnoughLines()) {
            const previousRoundNumber = roundNumber.getPrevious();
            if (previousRoundNumber) {
                this.addGames(screen, previousRoundNumber, categoryMap);
            }
        }
    }
}
import { AgainstGame, Game, GameOrder, RoundNumber, GameState, TogetherGame } from "ngx-sport";
import { ScreenConfig } from "../screenConfig/json";
import { ResultsScreen } from "../screens";

export class ResultsScreenCreator {

    constructor(protected screenConfig: ScreenConfig, protected maxLines: number) {
    }

    getScreen(lastRoundNumber: RoundNumber): ResultsScreen {

        const screen = new ResultsScreen(this.screenConfig, this.maxLines);
        this.addGames(screen, lastRoundNumber);
        return screen;
    }

    protected addGames(screen: ResultsScreen, roundNumber: RoundNumber) {
        let games: (AgainstGame | TogetherGame)[] = roundNumber.getGames(GameOrder.ByDate);
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
                this.addGames(screen, previousRoundNumber);
            }
        }
    }
}
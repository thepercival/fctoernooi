import { AgainstGame, Game, RoundNumber, State, TogetherGame } from "ngx-sport";
import { ResultsScreen } from "../screens";

export class ResultsScreenCreator {

    constructor(protected maxLines: number) {
    }

    getScreen(lastRoundNumber: RoundNumber): ResultsScreen {

        const screen = new ResultsScreen(this.maxLines);
        this.addGames(screen, lastRoundNumber);
        return screen;
    }

    protected addGames(screen: ResultsScreen, roundNumber: RoundNumber) {
        let games: (AgainstGame | TogetherGame)[] = roundNumber.getGames(Game.Order_By_Batch);
        games = games.reverse().filter(game => game.getState() === State.Finished);


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
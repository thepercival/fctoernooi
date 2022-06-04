import { Category, GameState, Round, Structure } from "ngx-sport";
import { ScreenConfig } from "../screenConfig/json";
import { EndRankingScreen } from "../screens";

export class EndRankingScreenCreator {

    constructor(protected screenConfig: ScreenConfig, protected maxLines: number) {
    }

    getScreens(categories: Category[]): EndRankingScreen[] {
        let screens: EndRankingScreen[] = [];
        categories.filter((category: Category) => {
            const rootRound = category.getRootRound();
            if (rootRound.getQualifyGroups().length === 0) {
                return false;
            }
            return this.leavesAreFinished([category.getRootRound()]);
        }).forEach((category: Category) => {
            screens = screens.concat(this.getCategoryScreens(category));
        });
        return screens;
    }

    private leavesAreFinished(rounds: Round[]): boolean {
        if (rounds.length === 0) {
            return true;
        }
        return rounds.every((round: Round): boolean => {
            return round.getGamesState() === GameState.Finished && this.leavesAreFinished(round.getChildren());
        });
    }

    private getCategoryScreens(category: Category): EndRankingScreen[] {
        const screens: EndRankingScreen[] = [];

        const nrOfItems = category.getRootRound().getNrOfPlaces();
        let currentRank = 1;
        while (currentRank <= nrOfItems) {
            const endRank = (currentRank - 1) + this.maxLines;
            screens.push(new EndRankingScreen(this.screenConfig, category, { min: currentRank, max: endRank }));
            currentRank = endRank + 1;
        }
        return screens;
    }
}
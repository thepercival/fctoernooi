import { GameState, Structure } from "ngx-sport";
import { ScreenConfig } from "../screenConfig/json";
import { EndRankingScreen } from "../screens";

export class EndRankingScreenCreator {

    constructor(protected screenConfig: ScreenConfig, protected maxLines: number) {
    }

    getScreens(structure: Structure): EndRankingScreen[] {
        const screens: EndRankingScreen[] = [];
        if (!(structure.getFirstRoundNumber().hasNext() || structure.getRootRound().getPoules().length === 1)) {
            return screens;
        }
        if (structure.getLastRoundNumber().getGamesState() !== GameState.Finished) {
            return screens;
        }
        const nrOfItems = structure.getRootRound().getNrOfPlaces();
        let currentRank = 1;
        while (currentRank <= nrOfItems) {
            const endRank = (currentRank - 1) + this.maxLines;
            screens.push(new EndRankingScreen(this.screenConfig, { min: currentRank, max: endRank }));
            currentRank = endRank + 1;
        }
        return screens;
    }
}
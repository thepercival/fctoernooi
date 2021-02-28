import { State, Structure } from "ngx-sport";
import { EndRankingScreen } from "../screens";

export class EndRankingScreenCreator {

    constructor(protected maxLines: number) {
    }

    getScreens(structure: Structure): EndRankingScreen[] {
        const screens: EndRankingScreen[] = [];
        if (!(structure.getFirstRoundNumber().hasNext() || structure.getRootRound().getPoules().length === 1)) {
            return screens;
        }
        if (structure.getLastRoundNumber().getState() !== State.Finished) {
            return screens;
        }
        const nrOfItems = structure.getRootRound().getNrOfPlaces();
        let currentRank = 1;
        while (currentRank <= nrOfItems) {
            const endRank = (currentRank - 1) + this.maxLines;
            screens.push(new EndRankingScreen({ min: currentRank, max: endRank }));
            currentRank = endRank + 1;
        }
        return screens;
    }
}
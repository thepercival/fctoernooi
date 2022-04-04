import { CompetitionSport, NameService, Poule, RoundNumber, GameState } from "ngx-sport";
import { ScreenConfig } from "../screenConfig/json";
import { PoulesRankingScreen } from "../screens";

export class PouleRankingScreensCreator {

    constructor(protected screenConfig: ScreenConfig, protected maxLines: number) {
    }

    getScreens(firstRoundNumber: RoundNumber): PoulesRankingScreen[] {
        const screens: PoulesRankingScreen[] = [];
        const roundNumbers: RoundNumber[] = this.getRoundNumbersForPouleRankings(firstRoundNumber).filter(roundNumber => roundNumber.needsRanking());
        if (roundNumbers.length === 0) {
            return screens;
        }
        const competitionSports = firstRoundNumber.getCompetitionSports();
        competitionSports.forEach((competitionSport: CompetitionSport) => {
            roundNumbers.forEach((roundNumber: RoundNumber) => {
                const poulesForRanking = roundNumber.getPoules().filter(poule => poule.needsRanking());
                const nameService = new NameService(undefined);
                const roundsDescription = nameService.getRoundNumberName(roundNumber);
                let pouleOne = poulesForRanking.shift();
                while (pouleOne !== undefined) {
                    const pouleTwo = poulesForRanking.shift();
                    const screen = new PoulesRankingScreen(this.screenConfig, competitionSport, pouleOne, pouleTwo, roundsDescription);
                    screens.push(screen);
                    pouleOne = poulesForRanking.shift();
                }
            });
        });
        return screens;
    }

    protected getRoundNumbersForPouleRankings(roundNumber: RoundNumber): RoundNumber[] {
        if (roundNumber.getGamesState() === GameState.Created || roundNumber.getGamesState() === GameState.InProgress) {
            return [roundNumber];
        }
        const nextRoundNumber = roundNumber.getNext();
        if (nextRoundNumber === undefined) {
            return [roundNumber];
        }
        if (nextRoundNumber.getGamesState() === GameState.Created) {
            return [roundNumber, nextRoundNumber];
        }
        return this.getRoundNumbersForPouleRankings(nextRoundNumber);
    }
}
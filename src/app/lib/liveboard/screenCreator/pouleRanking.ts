import { NameService, Poule, RoundNumber, State } from "ngx-sport";
import { PoulesRankingScreen } from "../screens";

export class PouleRankingScreensCreator {

    constructor(protected maxLines: number) {
    }

    getScreens(firstRoundNumber: RoundNumber): PoulesRankingScreen[] {
        const screens: PoulesRankingScreen[] = [];
        const roundNumbers: RoundNumber[] = this.getRoundNumbersForPouleRankings(firstRoundNumber).filter(roundNumber => roundNumber.needsRanking());
        if (roundNumbers.length === 0) {
            return screens;
        }
        roundNumbers.forEach(roundNumber => {
            const poulesForRanking = roundNumber.getPoules().filter(poule => poule.needsRanking());
            const nameService = new NameService(undefined);
            const roundsDescription = nameService.getRoundNumberName(roundNumber);
            const twoPoules: Poule[] = [];
            poulesForRanking.forEach(poule => {
                twoPoules.push(poule);
                if (twoPoules.length < 2) {
                    return;
                }
                screens.push(new PoulesRankingScreen(<Poule>twoPoules.shift(), <Poule>twoPoules.shift(), roundsDescription));
            });
            if (twoPoules.length === 1) {
                screens.push(new PoulesRankingScreen(<Poule>twoPoules.shift(), undefined, roundsDescription));
            }
        });
        return screens;
    }

    protected getRoundNumbersForPouleRankings(roundNumber: RoundNumber): RoundNumber[] {
        if (roundNumber.getState() === State.Created || roundNumber.getState() === State.InProgress) {
            return [roundNumber];
        }
        const nextRoundNumber = roundNumber.getNext();
        if (nextRoundNumber === undefined) {
            return [roundNumber];
        }
        if (nextRoundNumber.getState() === State.Created) {
            return [roundNumber, nextRoundNumber];
        }
        return this.getRoundNumbersForPouleRankings(nextRoundNumber);
    }
}
import { Game, NameService, PlanningService, Poule, RoundNumber, Structure } from 'ngx-sport';

import {
    CreatedAndInplayGamesScreen,
    EndRankingScreen,
    PlayedGamesScreen,
    PoulesRankingScreen,
    Screen,
    SponsorScreenService,
} from './liveboard/screens';
import { Tournament } from './tournament';

export class Liveboard {
    constructor(
        private tournament: Tournament,
        private structure: Structure,
        private maxLines: number,
        private planningService: PlanningService) { }

    getScreens(screenfilter: string): Screen[] {
        let screens: Screen[] = [];

        if (screenfilter === undefined) {
            const createdAndInplayGamesScreen = this.getScreenForGamesCreatedAndInplay();
            if (createdAndInplayGamesScreen !== undefined) {
                screens.push(createdAndInplayGamesScreen);
            }
            const playedGamesScreen = this.getScreenForGamesPlayed();
            if (playedGamesScreen !== undefined) {
                screens.push(playedGamesScreen);
            }
            const pouleRankingsScreens = this.getScreensForPouleRankings();
            let currentNrOfPouleRankingsScreens = 0;
            pouleRankingsScreens.forEach(pouleRankingScreen => {
                screens.push(pouleRankingScreen);
                if ((++currentNrOfPouleRankingsScreens % 2) === 0
                    && createdAndInplayGamesScreen !== undefined
                    && currentNrOfPouleRankingsScreens < pouleRankingsScreens.length
                ) {
                    screens.push(createdAndInplayGamesScreen);
                }
            });
            screens = screens.concat(this.getScreensForEndRanking());
        }
        if (screenfilter === undefined || screenfilter === 'sponsors') {
            screens = screens.concat(this.getScreensForSponsors());
        }

        return screens;
    }

    getScreenForGamesCreatedAndInplay(): Screen {
        const games: Game[] = this.getGamesCreatedAndInplay();
        if (games.length === 0) {
            return undefined;
        }
        return new CreatedAndInplayGamesScreen(games);
    }

    getGamesCreatedAndInplay(): Game[] {
        return this.getGamesCreatedAndInplayHelper(this.structure.getFirstRoundNumber());
    }

    getGamesCreatedAndInplayHelper(roundNumber: RoundNumber): Game[] {
        let games: Game[] = this.planningService.getGamesForRoundNumber(roundNumber, Game.ORDER_RESOURCEBATCH);
        games = games.filter(game => game.getState() !== Game.STATE_PLAYED &&
            (!roundNumber.getConfig().getEnableTime() || game.getStartDateTime() > new Date())
        );
        if (games.length < this.maxLines && roundNumber.hasNext()) {
            games = games.concat(this.getGamesCreatedAndInplayHelper(roundNumber.getNext()));
        }
        if (games.length > this.maxLines) {
            games = games.splice(0, this.maxLines);
        }
        return games;
    }

    private getScreensForPouleRankings(): Screen[] {
        const screens: Screen[] = [];
        const roundNumbers: RoundNumber[] = this.getRoundNumbersForPouleRankings();
        if (roundNumbers.length === 0) {
            return screens;
        }
        roundNumbers.forEach(roundNumber => {
            const poulesForRanking = roundNumber.getPoules();
            const nameService = new NameService();
            const roundsDescription = nameService.getRoundNumberName(roundNumber);
            const twoPoules: Poule[] = [];
            poulesForRanking.forEach(poule => {
                twoPoules.push(poule);
                if (twoPoules.length < 2) {
                    return;
                }
                screens.push(new PoulesRankingScreen(twoPoules.shift(), twoPoules.shift(), roundsDescription));
            });
            if (twoPoules.length === 1) {
                screens.push(new PoulesRankingScreen(twoPoules.shift(), undefined, roundsDescription));
            }
        });
        return screens;
    }

    protected getRoundNumbersForPouleRankings(): RoundNumber[] {
        return this.getRoundNumbersForPouleRankingsHelper(this.structure.getFirstRoundNumber());
    }

    protected getRoundNumbersForPouleRankingsHelper(roundNumber: RoundNumber): RoundNumber[] {
        if (roundNumber.getState() === Game.STATE_CREATED || roundNumber.getState() === Game.STATE_INPLAY) {
            return [roundNumber];
        }
        if (!roundNumber.hasNext()) {
            return [roundNumber];
        }
        if (roundNumber.getNext().getState() === Game.STATE_CREATED) {
            return [roundNumber, roundNumber.getNext()];
        }
        return this.getRoundNumbersForPouleRankingsHelper(roundNumber.getNext());
    }

    private getScreenForGamesPlayed(): Screen {
        const games: Game[] = this.getPlayedGames();
        if (games.length === 0) {
            return undefined;
        }
        return new PlayedGamesScreen(games);
    }

    getPlayedGames(): Game[] {
        return this.getPlayedGamesHelper(this.structure.getLastRoundNumber());
    }

    getPlayedGamesHelper(roundNumber: RoundNumber): Game[] {
        let games: Game[] = this.planningService.getGamesForRoundNumber(roundNumber, Game.ORDER_RESOURCEBATCH);
        games = games.reverse().filter(game => game.getState() === Game.STATE_PLAYED);
        if (games.length < this.maxLines && roundNumber.hasPrevious()) {
            games = games.concat(this.getPlayedGamesHelper(roundNumber.getPrevious()));
        }
        if (games.length > this.maxLines) {
            games = games.splice(0, this.maxLines);
        }
        return games;
    }

    private getScreensForSponsors(): Screen[] {
        const nrOfSponsors = this.tournament.getSponsors().length;
        if (nrOfSponsors === 0) {
            return [];
        }
        const sponsorScreenService = new SponsorScreenService(this.tournament.getSponsors());
        return sponsorScreenService.getScreens();
    }

    private getScreensForEndRanking(): Screen[] {
        const screens: Screen[] = [];
        if (this.structure.getLastRoundNumber().getState() !== Game.STATE_PLAYED) {
            return screens;
        }
        let nrOfItems = 0;
        this.structure.getRootRound().getPoules().forEach(poule => nrOfItems += poule.getPlaces().length);
        for (let currentRank = 0; currentRank + this.maxLines <= nrOfItems; currentRank += this.maxLines) {
            const endRank = currentRank + this.maxLines > nrOfItems ? nrOfItems : currentRank + this.maxLines;
            screens.push(new EndRankingScreen(currentRank + 1, endRank));
        }
        return screens;
    }
}

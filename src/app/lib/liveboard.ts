import { Game, NameService, Poule, RoundNumber, State, Structure } from 'ngx-sport';

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
        private maxLines: number
    ) { }

    // if more than one rank-screen, show schedulescreens in between
    getScreens(screenfilter: string): Screen[] {
        let screens: Screen[] = [];

        if (screenfilter === undefined) {
            const playedGamesScreen = this.getScreenForGamesPlayed();
            if (playedGamesScreen !== undefined) {
                screens.push(playedGamesScreen);
            }
            const createdAndInplayGamesScreens = this.getScreensForGamesCreatedAndInplay();
            createdAndInplayGamesScreens.forEach(screenIt => screens.push(screenIt));
            const pouleRankingsScreens = this.getScreensForPouleRankings();
            pouleRankingsScreens.forEach(pouleRankingScreen => {
                screens.push(pouleRankingScreen);
                createdAndInplayGamesScreens.forEach(screenIt => screens.push(screenIt));
            });
            screens = screens.concat(this.getScreensForEndRanking());
        }
        if (screenfilter === undefined || screenfilter === 'sponsors') {
            screens = screens.concat(this.getScreensForSponsors());
        }

        return screens;
    }

    // minimal current batch and next batch
    getScreensForGamesCreatedAndInplay(): Screen[] {
        const firstRoundNuber = this.structure.getFirstRoundNumber();
        const createdAndInplayGamesScreen = new CreatedAndInplayGamesScreen(this.maxLines);
        this.fillScreensForGamesCreatedAndInplay(createdAndInplayGamesScreen, firstRoundNuber, 0);
        if (createdAndInplayGamesScreen.isEmpty()) {
            return [];
        }
        const screens: Screen[] = [];
        screens.push(createdAndInplayGamesScreen);
        if (createdAndInplayGamesScreen.hasNext()) {
            screens.push(createdAndInplayGamesScreen.getNext());
        }
        return screens;
    }

    fillScreensForGamesCreatedAndInplay(screen: CreatedAndInplayGamesScreen, roundNumber: RoundNumber, nrOfBatchesCompleted: number) {
        const roundGames: Game[] = roundNumber.getGames(Game.ORDER_BY_BATCH);
        const now = new Date();
        let game: Game = roundGames.shift();
        let nextGame: Game = roundGames.shift();
        while ((nrOfBatchesCompleted < 2 || !screen.isFull()) && game !== undefined) {
            if (game.getState() === State.Finished ||
                (roundNumber.getValidPlanningConfig().getEnableTime() && game.getStartDateTime() < now)
            ) {
                game = nextGame;
                nextGame = roundGames.shift();
                continue;
            }

            screen.addGame(game);

            if (nextGame === undefined || game.getBatchNr() !== nextGame.getBatchNr()) {
                nrOfBatchesCompleted++;
            }

            if (screen.isFull() && screen.isFirst() && nrOfBatchesCompleted < 2) {
                screen = screen.createNext();
            }

            game = nextGame;
            nextGame = roundGames.shift();
        }
        if ((nrOfBatchesCompleted < 2 || !screen.isFull()) && roundNumber.hasNext()) {
            this.fillScreensForGamesCreatedAndInplay(screen, roundNumber.getNext(), nrOfBatchesCompleted);
        }
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
        if (roundNumber.getState() === State.Created || roundNumber.getState() === State.InProgress) {
            return [roundNumber];
        }
        if (!roundNumber.hasNext()) {
            return [roundNumber];
        }
        if (roundNumber.getNext().getState() === State.Created) {
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
        let games: Game[] = roundNumber.getGames(Game.ORDER_BY_BATCH);
        games = games.reverse().filter(game => game.getState() === State.Finished);
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
        if (!(this.structure.getFirstRoundNumber().hasNext() || this.structure.getRootRound().getPoules().length === 1)) {
            return screens;
        }
        if (this.structure.getLastRoundNumber().getState() !== State.Finished) {
            return screens;
        }
        const nrOfItems = this.structure.getRootRound().getNrOfPlaces();
        for (let currentRank = 0; currentRank + this.maxLines <= nrOfItems; currentRank += this.maxLines) {
            const endRank = currentRank + this.maxLines > nrOfItems ? nrOfItems : currentRank + this.maxLines;
            screens.push(new EndRankingScreen(currentRank + 1, endRank));
        }
        return screens;
    }
}

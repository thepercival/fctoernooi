import { AgainstGame, Game, NameService, Poule, RoundNumber, State, Structure, TogetherGame, TogetherScore } from 'ngx-sport';

import {
    CreatedAndInplayGamesScreen,
    EndRankingScreen,
    PlayedGamesScreen,
    PoulesRankingScreen,
    Screen,
    ScreenGames,
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
    getScreens(screenfilter: string | undefined): Screen[] {
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
            });
            if (pouleRankingsScreens.length > 0) {
                createdAndInplayGamesScreens.forEach(screenIt => screens.push(screenIt));
            }
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
        this.fillScreensForGamesCreatedAndInplay(createdAndInplayGamesScreen, firstRoundNuber);
        if (createdAndInplayGamesScreen.isEmpty()) {
            return [];
        }
        const screens: Screen[] = [];
        screens.push(createdAndInplayGamesScreen);
        const nextScreen = createdAndInplayGamesScreen.getNext();
        if (nextScreen) {
            screens.push(nextScreen);
        }
        return screens;
    }

    protected getNrOfScreensForGamesCreatedAndInplay(roundGames: Game[]): number {
        if (roundGames.length <= this.maxLines) {
            return 1;
        }
        let nrOfBatchGames = 0;
        const initialBatchNr = roundGames[0].getBatchNr();

        roundGames.every((game: Game) => {
            nrOfBatchGames++;
            return (initialBatchNr === game.getBatchNr());
        });
        return (nrOfBatchGames > this.maxLines) ? 2 : 1;
    }

    protected screensFilled(screen: CreatedAndInplayGamesScreen, maxNrOfScreens: number): boolean {
        if (!screen.isFull()) {
            return false;
        }
        if (screen.isFirst() && maxNrOfScreens === 2) {
            return false;
        }
        return true;
    }

    protected fillScreensForGamesCreatedAndInplay(screen: CreatedAndInplayGamesScreen, roundNumber: RoundNumber) {
        const roundGames: (AgainstGame | TogetherGame)[] = roundNumber.getGames(Game.Order_By_Batch);

        const maxNrOfScreens = this.getNrOfScreensForGamesCreatedAndInplay(roundGames);

        const now = new Date();
        let game: AgainstGame | TogetherGame | undefined = roundGames.shift();
        let nextGame: AgainstGame | TogetherGame | undefined = roundGames.shift();
        while (!this.screensFilled(screen, maxNrOfScreens) && game !== undefined) {
            const start = game.getStartDateTime();
            if (game.getState() === State.Finished || (roundNumber.getValidPlanningConfig().getEnableTime() && start && start < now)
            ) {
                game = nextGame;
                nextGame = roundGames.shift();
                continue;
            }

            screen.addGame(game);

            if (screen.isFull() && screen.isFirst() && maxNrOfScreens > 1) {
                screen = screen.createNext();
            }

            game = nextGame;
            nextGame = roundGames.shift();
        }
        const nextRoundNumber = roundNumber.getNext();
        if (nextRoundNumber && this.screensFilled(screen, maxNrOfScreens) === false) {
            this.fillScreensForGamesCreatedAndInplay(screen, nextRoundNumber);
        }
    }

    private getScreensForPouleRankings(): Screen[] {
        const screens: Screen[] = [];
        const roundNumbers: RoundNumber[] = this.getRoundNumbersForPouleRankings().filter(roundNumber => roundNumber.needsRanking());
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

    protected getRoundNumbersForPouleRankings(): RoundNumber[] {
        return this.getRoundNumbersForPouleRankingsHelper(this.structure.getFirstRoundNumber());
    }

    protected getRoundNumbersForPouleRankingsHelper(roundNumber: RoundNumber): RoundNumber[] {
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
        return this.getRoundNumbersForPouleRankingsHelper(nextRoundNumber);
    }

    private getScreenForGamesPlayed(): Screen | undefined {
        const screenGames = this.getPlayedScreenGames();
        if (screenGames.games.length === 0) {
            return undefined;
        }
        return new PlayedGamesScreen(screenGames);
    }

    getPlayedScreenGames(): ScreenGames {
        const screenGames = { usedGameModes: 0, games: [] };
        this.setPlayedScreenGames(this.structure.getLastRoundNumber(), screenGames);
        return screenGames;
    }

    protected setPlayedScreenGames(roundNumber: RoundNumber, screenGames: ScreenGames) {
        let games: (AgainstGame | TogetherGame)[] = roundNumber.getGames(Game.Order_By_Batch);
        if (games.length > this.maxLines) {
            games = games.splice(0, this.maxLines);
        }
        const preFilteredNrOfGames = games.length;
        games = games.reverse().filter(game => game.getState() === State.Finished);
        if (preFilteredNrOfGames > games.length) {
            screenGames.usedGameModes |= roundNumber.getValidPlanningConfig().getGameMode();
        }
        if (games.length < this.maxLines) {
            const previousRoundNumber = roundNumber.getPrevious();
            if (previousRoundNumber) {
                this.setPlayedScreenGames(previousRoundNumber, screenGames);
            }
        }
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
        let currentRank = 1;
        while (currentRank <= nrOfItems) {
            const endRank = (currentRank - 1) + this.maxLines;
            screens.push(new EndRankingScreen({ min: currentRank, max: endRank }));
            currentRank = endRank + 1;
        }
        return screens;
    }
}

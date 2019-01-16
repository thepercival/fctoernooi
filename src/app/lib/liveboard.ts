import { Game, NameService, PlanningService, Poule, PoulePlace, Ranking, RoundNumber, Structure } from 'ngx-sport';

import {
    CreatedAndInplayGamesScreen,
    EndRankingScreen,
    PlayedGamesScreen,
    PoulesRankingScreen,
    Screen,
    SponsorScreen,
} from './liveboard/screens';
import { Tournament } from './tournament';

export class Liveboard {

    constructor(
        private tournament: Tournament,
        private structure: Structure,
        private maxLines: number,
        private ranking: Ranking,
        private planningService: PlanningService) { }

    getScreens(): Screen[] {
        let screens: Screen[] = [];

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

        return screens.concat(this.getScreensForSponsors());
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
        const roundNumber = this.getRoundNumberForPouleRankings();
        if (roundNumber === undefined) {
            return screens;
        }
        const poulesForRanking = this.getPoulesForRanking(roundNumber);
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
        return screens;
    }

    getPoulesForRanking(roundNumber: RoundNumber): Poule[] {
        let poules: Poule[] = [];
        roundNumber.getRounds().forEach(round => {
            poules = poules.concat(round.getPoules().filter(poule => this.hasPouleAPlaceWithTwoGamesPlayed(poule)));
        });
        return poules;
    }

    protected getRoundNumberForPouleRankings(): RoundNumber {
        return this.getRoundNumberForPouleRankingsHelper(this.structure.getFirstRoundNumber());
    }

    /**
     * pak laatst gespeelde ronde, 
     * wanner er een volgende ronde is en deze is inplay, gebruik dan deze
     * 
     * @param roundNumber
     */
    protected getRoundNumberForPouleRankingsHelper(roundNumber: RoundNumber): RoundNumber {
        if (roundNumber.getState() === Game.STATE_INPLAY) {
            return roundNumber;
        }
        if (roundNumber.getState() === Game.STATE_PLAYED) {
            if (!roundNumber.hasNext() || roundNumber.getNext().getState() === Game.STATE_CREATED) {
                return roundNumber;
            }
            return this.getRoundNumberForPouleRankingsHelper(roundNumber.getNext());
        }
        return undefined;
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
        if ( nrOfSponsors === 0) {
            return [];
        }
        const nrOfScreens = ( ( this.maxLines - ( nrOfSponsors % this.maxLines ) ) + nrOfSponsors ) / this.maxLines;
        const nrOfSponsorsPerScreen = Math.round( nrOfSponsors / nrOfScreens );
        const screens: Screen[] = [];
        const sponsors = this.tournament.getSponsors().slice();
        while (sponsors.length > 0) {
            screens.push(new SponsorScreen(sponsors.splice(0, nrOfSponsorsPerScreen)));
        }
        return screens;
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

    hasPouleAPlaceWithTwoGamesPlayed(poule: Poule): boolean {
        return poule.getPlaces().some((place: PoulePlace) => this.ranking.getNrOfGamesWithState(place, place.getGames()) > 1);
    }
}

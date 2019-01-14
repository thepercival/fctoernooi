import { Structure, Round, PoulePlace, Game, Poule, PlanningService, RoundNumber, NameService, Ranking } from 'ngx-sport';

import { Tournament } from './tournament';
import {
    EndRankingScreen,
    Screen,
    PlayedGamesScreen,
    PoulesRankingScreen,
    ScheduledGamesScreen,
    SponsorScreen,
} from './liveboard/screens';

export class Liveboard {

    constructor(
        private tournament: Tournament, 
        private structure: Structure, 
        private maxLines: number,
        private ranking: Ranking,
        private planningService: PlanningService) {}

    getScreens(): Screen[] {
        // const lastPlayedRoundNumber = this.getLastPlayedRoundNumber(firstRoundNumber);

        const createdAndInplayGamesScreen = this.getScreenForGamesCreatedAndInplay();
        
        const playedGamesScreen = this.getScreenForGamesPlayed();
        
        const sponsorScreens = this.getScreensForSponsors();        
        
        const pouleRankingsScreens = this.getScreensForPouleRankings( a round number );        
        
        const endRankingScreens = this.getScreensForEndRanking();

        // per 1 of 2 pouleranking-screens, hele riedeltje 1x keer??
        return screens;
    }

    /*getActiveRoundNumber( states: number ): RoundNumber {
        return this.getActiveRoundNumberHelper( this.structure.getFirstRoundNumber(), states);
    }

    protected getActiveRoundNumberHelper( roundNumber: RoundNumber, states: number ): RoundNumber {
        const state = roundNumber.getState();
        if( (state & states) === state ) {
            if( state)
            return 
        }
        const lastPlayedRoundNumber = this.getLastRoundNumberPlayed(firstRoundNumber);
        const nextRoundNumber = lastPlayedRoundNumber !== undefined ? lastPlayedRoundNumber.getNext() : firstRoundNumber;
        const stateNextRoundNumber = nextRoundNumber !== undefined ? this.getStateRoundNumber(nextRoundNumber) : undefined;

        let roundNumberForSchedule;
        let lastRoundNumberWithPlayedGames;
        if (lastPlayedRoundNumber === undefined) { // voor het begin
            roundNumberForSchedule = nextRoundNumber;
        } else if (stateNextRoundNumber === Game.STATE_CREATED) { // tussen twee ronden in
            roundNumberForSchedule = nextRoundNumber;
            lastRoundNumberWithPlayedGames = lastPlayedRoundNumber;
        } else if (stateNextRoundNumber === Game.STATE_INPLAY) { // tijdens een ronde
            roundNumberForSchedule = nextRoundNumber;
            lastRoundNumberWithPlayedGames = nextRoundNumber;
        } else if (nextRoundNumber === undefined) { // na het einde
            lastRoundNumberWithPlayedGames = lastPlayedRoundNumber;
        }
    }*/

    /*protected getLastRoundNumberPlayed(roundNumber: RoundNumber): RoundNumber {
        if (roundNumber.getState() === Game.STATE_PLAYED) {
            if (!roundNumber.hasNext() || roundNumber.getNext().getState() < Game.STATE_PLAYED) {
                return roundNumber;
            }
            return this.getLastRoundNumberPlayed(roundNumber.getNext());
        }
        if (roundNumber.isFirst()) {
            return undefined;
        }
        return this.getLastRoundNumberPlayed(roundNumber.getPrevious());
    }*/

    /*getRoundNumberForCetainGoal( theGoal ): RoundNumber {
        const lastPlayedRoundNumber = this.getLastPlayedRoundNumber(firstRoundNumber);
        const nextRoundNumber = lastPlayedRoundNumber !== undefined ? lastPlayedRoundNumber.getNext() : firstRoundNumber;
        const stateNextRoundNumber = nextRoundNumber !== undefined ? this.getStateRoundNumber(nextRoundNumber) : undefined;

        let roundNumberForSchedule;
        let lastRoundNumberWithPlayedGames;
        if (lastPlayedRoundNumber === undefined) { // voor het begin
            roundNumberForSchedule = nextRoundNumber;
        } else if (stateNextRoundNumber === Game.STATE_CREATED) { // tussen twee ronden in
            roundNumberForSchedule = nextRoundNumber;
            lastRoundNumberWithPlayedGames = lastPlayedRoundNumber;
        } else if (stateNextRoundNumber === Game.STATE_INPLAY) { // tijdens een ronde
            roundNumberForSchedule = nextRoundNumber;
            lastRoundNumberWithPlayedGames = nextRoundNumber;
        } else if (nextRoundNumber === undefined) { // na het einde
            lastRoundNumberWithPlayedGames = lastPlayedRoundNumber;
        }
    }*/

    getScreenForGamesCreatedAndInplay(): Screen {
        const games: Game[] = this.getGamesCreatedAndInplay();
        if( games.length === 0) {
            return undefined;
        }
        return new ScheduledGamesScreen(games);
    }

    // getScreensForScheduleOld(roundNumber: RoundNumber): Screen[] {
    //     const screens: Screen[] = [];
    //     const games: Game[] = this.getScheduledGames(roundNumber);

    //     // nadenken over scherm-verhouding

    //     // sponsors
    //     // uitslagen
    //     // schema
    //     // poules


    //     const pouleRankingScreens = this.getScreensForPouleRanking(roundNumber);
    //     const scheduledGamesScreen = new ScheduledGamesScreen(roundNumber, games);
    //     pouleRankingScreens.forEach(pouleRankingScreen => {
    //         if (games.length > 0) {
    //             screens.push(scheduledGamesScreen);
    //         }
    //         screens.push(pouleRankingScreen);
    //     });
    //     if (screens.length === 0 && games.length > 0) {
    //         screens.push(scheduledGamesScreen);
    //     }
    //     return screens;
    // }

    getGamesCreatedAndInplay(): Game[] {
        return this.getGamesCreatedAndInplayHelper(this.structure.getFirstRoundNumber());
    }

    getGamesCreatedAndInplayHelper(roundNumber: RoundNumber): Game[] {
        let games: Game[] = this.planningService.getGamesForRoundNumber(roundNumber, Game.ORDER_RESOURCEBATCH);
        games = games.filter(game => game.getState() !== Game.STATE_PLAYED /*&&
            (!roundNumber.getConfig().getEnableTime() || game.getStartDateTime() > new Date())*/
        );
        if (games.length < this.maxLines && roundNumber.hasNext()) {
            games = games.concat(this.getGamesCreatedAndInplayHelper(roundNumber.getNext()));
        }
        if (games.length > this.maxLines) {
            games = games.splice(0, this.maxLines);
        }
        return games;
    }

    /**
     * show poules which needs ranking
     */
    getPoulesForRanking(roundNumber: RoundNumber): Poule[] {
        let poules: Poule[] = [];
        roundNumber.getRounds().forEach(round => {
            poules = poules.concat(round.getPoules().filter(poule => this.hasPouleAPlaceWithTwoGamesPlayed(poule)));
        });
        return poules;
    }

    getPoules(roundNumber: RoundNumber): Poule[] {
        let poules: Poule[] = [];
        roundNumber.getRounds().forEach(round => {
            poules = poules.concat(round.getPoules());
        });
        return poules;
    }

    private getScreensForPouleRankings(roundNumber: RoundNumber): Screen[] {
        const screens: Screen[] = [];
        const twoPoules: Poule[] = [];
        const poulesForRanking = this.getPoulesForRanking(roundNumber);
        const nameService = new NameService();
        const roundsDescription = nameService.getRoundNumberName(roundNumber);
        poulesForRanking.forEach(poule => {
            twoPoules.push(poule);
            if (twoPoules.length < 2) {
                return;
            }
            screens.push(new PoulesRankingScreen(roundNumber, twoPoules.shift(), twoPoules.shift(), roundsDescription));
        });
        if (twoPoules.length === 1) {
            screens.push(new PoulesRankingScreen(roundNumber, twoPoules.shift(), undefined, roundsDescription));
        }
        return screens;
    }

    private getScreenForGamesPlayed(): Screen {
        const games: Game[] = this.getPlayedGames();
        if (games.length === 0) {
            return undefined;    
        }
        return new PlayedGamesScreen(games);        
    }

    /**
     * show next 8 games
     */
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
        if (this.tournament.getSponsors().length > 0) {
            return [];
        }
        const screens: Screen[] = [];
        const sponsors = this.tournament.getSponsors().slice();
        while (sponsors.length > 0) {
            screens.push(new SponsorScreen(sponsors.splice(0, this.maxLines)));
        }
        return screens;
    }

    private getScreensForEndRanking(): Screen[] {
        const screens: Screen[] = [];
        if( this.structure.getLastRoundNumber().getState() !== Game.STATE_PLAYED) {
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

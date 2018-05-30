import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    Game,
    PlanningService,
    Poule,
    PoulePlace,
    Ranking,
    RankingItem,
    Round,
    StructureNameService,
    StructureRepository,
} from 'ngx-sport';
import { Subscription, timer } from 'rxjs';

import { AuthService } from '../../../auth/auth.service';
import { GlobalEventsManager } from '../../../common/eventmanager';
import { IconManager } from '../../../common/iconmanager';
import { NavBarTournamentTVViewLink } from '../../../nav/nav.component';
import { TournamentComponent } from '../component';
import { TournamentRepository } from '../repository';
import { TournamentRole } from '../role';
import { Sponsor } from '../sponsor';

@Component({
    selector: 'app-tournament-view-tv',
    templateUrl: './tv.component.html',
    styleUrls: ['./tv.component.scss']
})
export class TournamentViewTvComponent extends TournamentComponent implements OnInit, OnDestroy {

    private timerSubscription: Subscription;
    ranking: Ranking;
    private planningService: PlanningService;
    screenDef: ScreenDefinition;
    private allRoundsByNumber: any;
    private maxLines = 8;

    constructor(
        route: ActivatedRoute,
        router: Router,
        private authService: AuthService,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private globalEventsManager: GlobalEventsManager,
        private iconManager: IconManager,
        public nameService: StructureNameService
    ) {
        super(route, router, tournamentRepository, structureRepository);
        this.ranking = new Ranking(Ranking.RULESSET_WC);
    }

    ngOnInit() {
        super.myNgOnInit(() => this.processScreens());
    }

    processScreens() {
        const link: NavBarTournamentTVViewLink = { showTVIcon: false, tournamentId: this.tournament.getId(), link: '/toernooi/view' };
        this.globalEventsManager.toggleTVIconInNavBar.emit(link);
        this.planningService = new PlanningService(this.structureService);
        this.allRoundsByNumber = this.structureService.getAllRoundsByNumber();
        const screenDefs = this.getScreenDefinitions();
        if (screenDefs.length === 0) {
            return;
        }
        this.timerSubscription = timer(0, 10000).subscribe(number => {
            this.screenDef = screenDefs.shift();
            if (this.screenDef === undefined) {
                this.timerSubscription.unsubscribe();
                this.getDataAndProcessScreens();
            }
        });
    }

    getDataAndProcessScreens() {
        this.setData(this.tournament.getId(), () => this.processScreens());
    }

    getRoundsByNumber(roundNumber: number): Round[] {
        return this.allRoundsByNumber[roundNumber];
    }

    getScreenDefinitions(): ScreenDefinition[] {
        const lastPlayedRoundNumber = this.getLastPlayedRoundNumber();
        const nextRoundNumber = lastPlayedRoundNumber + 1;
        const stateNextRoundNumber = this.getStateRoundNumber(nextRoundNumber);

        let roundNumberForScheduleAndRanking;
        let previousPlayedRoundNumber;
        if (lastPlayedRoundNumber === 0) { // voor het begin
            roundNumberForScheduleAndRanking = nextRoundNumber;
        } else if (stateNextRoundNumber === Game.STATE_CREATED) { // tussen twee ronden in
            roundNumberForScheduleAndRanking = nextRoundNumber;
            previousPlayedRoundNumber = lastPlayedRoundNumber;
        } else if (stateNextRoundNumber === Game.STATE_INPLAY) { // tijdens een ronde
            roundNumberForScheduleAndRanking = nextRoundNumber;
        } else if (stateNextRoundNumber === Game.STATE_PLAYED) { // na het einde
            previousPlayedRoundNumber = lastPlayedRoundNumber;
        }

        let screenDefs: ScreenDefinition[] = [];
        if (roundNumberForScheduleAndRanking !== undefined) {
            screenDefs = screenDefs.concat(this.getScreenDefinitionsForScheduleAndRanking(roundNumberForScheduleAndRanking));
        } else {
            screenDefs = screenDefs.concat(this.getScreenDefinitionsForEndRanking(previousPlayedRoundNumber));
        }
        // if (previousPlayedRoundNumber !== undefined) {
        //     screenDefs = screenDefs.concat(this.getScreenDefinitionsForResultsAndRanking(previousPlayedRoundNumber));
        // }
        // if (this.tournament.getSponsors().length > 0) {
        //     screenDefs = screenDefs.concat(this.getScreenDefinitionsForSponsors(previousPlayedRoundNumber));
        // }

        return screenDefs;
    }

    getFontSizePercentage(nrOfSponsors: number) {
        const fontSizePerc = (8 / nrOfSponsors) * 100;
        if (fontSizePerc > 150) {
            return 150;
        }
        return fontSizePerc;
    }

    aSponsorHasUrl(sponsors: Sponsor[]): boolean {
        return sponsors.some(sponsor => sponsor.getUrl() !== undefined && sponsor.getUrl().length > 0);
    }

    /**
     * show next 8 games, show rankings
     */
    getScreenDefinitionsForScheduleAndRanking(roundNumber: number): ScreenDefinition[] {
        const screenDefs: ScreenDefinition[] = [];
        const games: Game[] = this.getScheduledGamesForRoundNumber(roundNumber);

        const rankingScreenDefs = this.getScreenDefinitionsForRanking(roundNumber, this.getPoulesForRanking(roundNumber));
        const roundsDescription = this.nameService.getRoundsName(roundNumber, this.allRoundsByNumber[roundNumber]);
        const scheduledGamesScreenDef = new ScheduledGamesScreenDefinition(roundNumber, games, roundsDescription);
        rankingScreenDefs.forEach(rankingScreenDef => {
            if (games.length > 0) {
                screenDefs.push(scheduledGamesScreenDef);
            }
            screenDefs.push(rankingScreenDef);
        });
        if (screenDefs.length === 0 && games.length > 0) {
            screenDefs.push(scheduledGamesScreenDef);
        }
        return screenDefs;
    }

    /**
     * show next 8 games
     */
    getScheduledGamesForRoundNumber(roundNumber: number): Game[] {
        const roundsByNumber = this.getRoundsByNumber(roundNumber);
        let games: Game[] = this.planningService.getGamesForRoundNumber(roundNumber, Game.ORDER_RESOURCEBATCH);
        games = games.filter(game => game.getState() !== Game.STATE_PLAYED);
        if (games.length > this.maxLines) {
            return games.splice(0, this.maxLines);
        }
        return games;
    }

    needsRanking(roundsByNumber: Round[]): boolean {
        return roundsByNumber.some(round => round.needsRanking());
    }

    /**
     * show poules which needs ranking
     */
    getPoulesForRanking(roundNumber: number): Poule[] {
        let poules: Poule[] = [];
        const roundsByNumber = this.getRoundsByNumber(roundNumber);
        roundsByNumber.forEach(round => {
            poules = poules.concat(round.getPoules().filter(poule => this.hasPouleAPlaceWithTwoGamesPlayed(poule)));
        });
        return poules;
    }

    getPoules(roundNumber: number): Poule[] {
        let poules: Poule[] = [];
        const roundsByNumber = this.getRoundsByNumber(roundNumber);
        roundsByNumber.forEach(round => {
            poules = poules.concat(round.getPoules());
        });
        return poules;
    }

    /**
     * show poules which needs ranking
     */
    getScreenDefinitionsForRanking(roundNumber: number, poules: Poule[]): ScreenDefinition[] {
        const screenDefs: ScreenDefinition[] = [];
        const twoPoules: Poule[] = [];
        const poulesForRanking = this.getPoulesForRanking(roundNumber);
        poulesForRanking.forEach(poule => {
            twoPoules.push(poule);
            if (twoPoules.length < 2) {
                return;
            }
            screenDefs.push(new PoulesRankingScreenDefinition(roundNumber, twoPoules.shift(), twoPoules.shift()));
        });
        if (twoPoules.length === 1) {
            screenDefs.push(new PoulesRankingScreenDefinition(roundNumber, twoPoules.shift()));
        }
        return screenDefs;
    }

    getScreenDefinitionsForResultsAndRanking(roundNumber: number): ScreenDefinition[] {
        const poulesForRanking = this.getPoulesForRanking(roundNumber);
        const screenDefs: ScreenDefinition[] = this.getScreenDefinitionsForRanking(roundNumber, poulesForRanking);
        const poulesForResults = this.getPoules(roundNumber).filter(poule => {
            return !poulesForRanking.some(pouleForRanking => pouleForRanking === poule);
        });
        // loop door de poules die wedstrijden moeten tonen( deze poules eerst samenvoegen)
        const games: Game[] = this.getResultsForRoundPoules(poulesForResults);
        if (games.length > 0) {
            const roundsDescription = this.nameService.getRoundsName(roundNumber, this.allRoundsByNumber[roundNumber]);
            screenDefs.push(new PlayedGamesScreenDefinition(roundNumber, games, roundsDescription));
        }
        return screenDefs;
    }

    getScreenDefinitionsForSponsors(roundNumber: number): ScreenDefinition[] {
        const screenDefs: ScreenDefinition[] = [];
        const sponsors = this.tournament.getSponsors().slice();
        while (sponsors.length > 0) {
            screenDefs.push(new SponsorScreenDefinition(roundNumber, sponsors.splice(0, this.maxLines)));
        }
        return screenDefs;
    }

    getScreenDefinitionsForEndRanking(roundNumber: number): ScreenDefinition[] {
        const screenDefs: ScreenDefinition[] = [];
        const rankingItems = this.getEndRankingItems(this.structureService.getFirstRound());
        while (rankingItems.length > 0) {
            screenDefs.push(new EndRankingScreenDefinition(roundNumber, rankingItems.splice(0, this.maxLines)));
        }
        return screenDefs;
    }

    getEndRankingItems(round: Round, rankingItems: RankingItem[] = []): RankingItem[] {
        if (round === undefined) {
            return [];
        }
        this.getEndRankingItems(round.getChildRound(Round.WINNERS), rankingItems);
        if (round.getNrOfPlacesChildRounds() < round.getPoulePlaces().length) {
            this.getEndRankingItemsHelper(round).forEach(rankingItem => {
                rankingItems.push(new RankingItem(rankingItems.length + 1, rankingItem.getPoulePlace()));
            });
        }
        this.getEndRankingItems(round.getChildRound(Round.LOSERS), rankingItems);
        return rankingItems;
    }

    getEndRankingItemsHelper(round: Round): RankingItem[] {
        let rankingItems: RankingItem[] = [];

        const poulePlacesToProcess: PoulePlace[] = [];
        {
            const poulePlacesPerNumber = round.getPoulePlacesPerNumber(Round.WINNERS);
            poulePlacesPerNumber.forEach(poulePlaces => {
                const rankingService = new Ranking(Ranking.RULESSET_WC);
                const winnerToQualifyRule = poulePlaces[0].getToQualifyRule(Round.WINNERS);
                if (winnerToQualifyRule === undefined) {
                    rankingItems = rankingItems.concat(rankingService.getItemsForRound(round, poulePlaces));
                    return;
                }
                if (winnerToQualifyRule.isMultiple() === false) {
                    return;
                }
                // multiple
                const rankingItemsTmp = rankingService.getItemsForRound(round, poulePlaces);
                rankingItemsTmp.splice(0, winnerToQualifyRule.getToPoulePlaces().length);
                const loserToQualifyRule = poulePlaces[poulePlaces.length - 1].getToQualifyRule(Round.LOSERS);
                if (loserToQualifyRule === undefined) {
                    rankingItems = rankingItems.concat(rankingItemsTmp);
                } else {
                    rankingItemsTmp.forEach(rankingItemTmp => poulePlacesToProcess.push(rankingItemTmp.getPoulePlace()));
                }
            });
        }

        // check for LOSERS MULTIPLE
        const poulePlacesPerNumberLosers = round.getPoulePlacesPerNumber(Round.LOSERS);
        poulePlacesPerNumberLosers.forEach(poulePlaces => {
            const loserToQualifyRule = poulePlaces[0].getToQualifyRule(Round.LOSERS);
            if (loserToQualifyRule === undefined || loserToQualifyRule.isMultiple() === false) {
                return;
            }
            if (loserToQualifyRule.isMultiple() === false) {
                poulePlaces.forEach(poulePlace => {
                    const index = poulePlacesToProcess.indexOf(poulePlace);
                    if (index > -1) {
                        poulePlacesToProcess.splice(index, 1);
                    }
                });
            }
            // multiple
            const rankingService = new Ranking(Ranking.RULESSET_WC);
            const rankingItemsTmp = rankingService.getItemsForRound(round, poulePlaces);
            rankingItemsTmp.reverse();
            const qualifiedRankingItemsTmp = rankingItemsTmp.splice(0, loserToQualifyRule.getToPoulePlaces().length);
            qualifiedRankingItemsTmp.forEach(qualifiedRankingItemTmp => {
                const index = poulePlacesToProcess.indexOf(qualifiedRankingItemTmp.getPoulePlace());
                if (index > -1) {
                    poulePlacesToProcess.splice(index, 1);
                }
            });
            rankingItemsTmp.forEach(rankingItemTmp => {
                if (poulePlacesToProcess.find(
                    poulePlaceToProcess => poulePlaceToProcess === rankingItemTmp.getPoulePlace()
                ) === undefined
                ) {
                    poulePlacesToProcess.push(rankingItemTmp.getPoulePlace());
                }
            });
        });

        const rankingServiceTmp = new Ranking(Ranking.RULESSET_WC);
        return rankingItems.concat(rankingServiceTmp.getItemsForRound(round, poulePlacesToProcess));
    }

    getResultsForRoundPoules(poulesForResults: Poule[]): Game[] {
        let games: Game[] = [];
        poulesForResults.forEach(poule => {
            games = games.concat(poule.getGames());
        });
        return games;
    }

    hasPouleAPlaceWithTwoGamesPlayed(poule: Poule): boolean {
        return poule.getPlaces().some((place: PoulePlace) => this.ranking.getNrOfGamesWithState(place, place.getGames()) > 1);
    }

    getLastPlayedRoundNumber(roundNumber: number = 1): number {
        const roundsByNumber = this.getRoundsByNumber(roundNumber);
        if (roundsByNumber === undefined) {
            return roundNumber - 1;
        }
        const played = !roundsByNumber.some(round => round.getState() !== Game.STATE_PLAYED);
        if (played !== true) {
            return roundNumber - 1;
        }
        return this.getLastPlayedRoundNumber(roundNumber + 1);
    }

    getStateRoundNumber(roundNumber: number): number {
        const roundsByNumber = this.getRoundsByNumber(roundNumber);
        if (roundsByNumber === undefined) {
            return Game.STATE_PLAYED;
        }
        const hasGames = roundsByNumber.some(round => round.getGames().length > 0);
        if (!hasGames) {
            return Game.STATE_PLAYED;
        }
        const inplay = roundsByNumber.some(round => round.getState() !== Game.STATE_CREATED);
        if (inplay !== true) {
            return Game.STATE_CREATED;
        }
        return Game.STATE_INPLAY;
    }

    ngOnDestroy() {
        this.globalEventsManager.toggleTVIconInNavBar.emit({});
        this.timerSubscription.unsubscribe();
    }

    isAdmin(): boolean {
        return this.tournament.hasRole(this.authService.getLoggedInUserId(), TournamentRole.ADMIN);
    }

    isPoulesRankingScreenDef(): boolean {
        return this.screenDef instanceof PoulesRankingScreenDefinition;
    }

    isEndRankingScreenDef(): boolean {
        return this.screenDef instanceof EndRankingScreenDefinition;
    }

    isGamesScreenDef(): boolean {
        return this.screenDef instanceof GamesScreenDefinition;
    }

    isSponsorScreenDef(): boolean {
        return this.screenDef instanceof SponsorScreenDefinition;
    }

    isScheduled(): boolean {
        return this.screenDef instanceof ScheduledGamesScreenDefinition;
    }

    hasFields() {
        return this.tournament.getCompetition().getFields().length > 0;
    }

    hasReferees() {
        return this.tournament.getCompetition().getReferees().length > 0;
    }

    getScore(game: Game): string {
        const sScore = ' - ';
        if (game.getState() !== Game.STATE_PLAYED) {
            return sScore;
        }
        return game.getFinalScore().getHome() + sScore + game.getFinalScore().getAway();
    }

    getRankingItems(poule: Poule): RankingItem[] {
        return this.ranking.getItems(poule.getPlaces(), poule.getGames());
    }

    getGoalDifference(poulePlace: PoulePlace, games: Game[]) {
        const nrOfGoalsScored = this.ranking.getNrOfGoalsScored(poulePlace, games);
        const nrOfGoalsReceived = this.ranking.getNrOfGoalsReceived(poulePlace, games);
        return (nrOfGoalsScored - nrOfGoalsReceived) + ' ( ' + nrOfGoalsScored + ' - ' + nrOfGoalsReceived + ' )';
    }

    getClassPostfix(winnersOrLosers: number): string {
        return winnersOrLosers === Round.WINNERS ? 'success' : (winnersOrLosers === Round.LOSERS ? 'danger' : '');
    }

    getQualificationClass(poule: Poule, poulePlaceNumber: number): string {
        const poulePlace: PoulePlace = poule.getPlace(poulePlaceNumber);
        const rules = poulePlace.getToQualifyRules();
        if (rules.length === 2) {
            return 'fa fa-circle  text-warning';
        } else if (rules.length === 1) {
            const qualifyRule = rules[0];
            const singleColor = this.getClassPostfix(qualifyRule.getWinnersOrLosers());
            return 'fa fa-circle text-' + (qualifyRule.isMultiple() ? 'warning' : singleColor);
        }
        return '';
    }
}

export class ScreenDefinition {
    roundNumber: number;

    constructor(roundNumber: number) {
        this.roundNumber = roundNumber;
    }
}

export class PoulesRankingScreenDefinition extends ScreenDefinition {
    private pouleOne: Poule;
    private pouleTwo: Poule;

    constructor(roundNumber: number, pouleOne: Poule, pouleTwo?: Poule) {
        super(roundNumber);
        this.pouleOne = pouleOne;
        this.pouleTwo = pouleTwo;
    }

    getFirstPoule(): Poule {
        return this.pouleOne;
    }

    getLastPoule(): Poule {
        return this.pouleTwo;
    }

    getPoules(): Poule[] {
        const poules = [this.pouleOne];
        if (this.pouleTwo !== undefined) {
            poules.push(this.pouleTwo);
        }
        return poules;
    }

    getDescription() {
        return 'stand';
    }
}

export class EndRankingScreenDefinition extends ScreenDefinition {
    private items: RankingItem[];

    constructor(roundNumber: number, items: RankingItem[]) {
        super(roundNumber);
        this.items = items;
    }

    getItems(): RankingItem[] {
        return this.items;
    }

    getDescription() {
        return 'eindstand';
    }
}

export class GamesScreenDefinition extends ScreenDefinition {
    private games: Game[]; // max 8

    constructor(roundNumber: number, games: Game[]) {
        super(roundNumber);
        this.games = games;
    }

    getGames(): Game[] {
        return this.games;
    }

    getDescription() {
        return 'programma';
    }
}

export interface IGamesScreenDefinition {
    isScheduled(): boolean;
}

export class ScheduledGamesScreenDefinition extends GamesScreenDefinition implements IGamesScreenDefinition {

    private description: string;

    constructor(roundNumber: number, scheduledGames: Game[], roundsDescription: string) {
        super(roundNumber, scheduledGames);
        this.description = 'programma - ' + roundsDescription;
    }

    isScheduled(): boolean {
        return true;
    }

    getDescription() {
        return this.description;
    }
}

export class PlayedGamesScreenDefinition extends GamesScreenDefinition implements IGamesScreenDefinition {
    playedGames: Game[];
    private description: string;

    constructor(roundNumber: number, playedGames: Game[], roundsDescription: string) {
        super(roundNumber, playedGames);
        this.description = 'uitslagen - ' + roundsDescription;
    }

    isScheduled(): boolean {
        return false;
    }

    getDescription() {
        return this.description;
    }
}

export class SponsorScreenDefinition extends ScreenDefinition {
    private sponsors: Sponsor[]; // max 8

    constructor(roundNumber: number, sponsors: Sponsor[]) {
        super(roundNumber);
        this.sponsors = sponsors;
    }

    getDescription() {
        return 'sponsoren';
    }

    getSponsors() {
        return this.sponsors;
    }
}

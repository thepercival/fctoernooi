import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    EndRanking,
    Game,
    NameService,
    PlanningService,
    Poule,
    PoulePlace,
    Ranking,
    RankingItem,
    Round,
    RoundNumber,
    StructureRepository,
} from 'ngx-sport';
import { Subscription, timer } from 'rxjs';

import { AuthService } from '../../../auth/auth.service';
import { GlobalEventsManager } from '../../../common/eventmanager';
import { IconManager } from '../../../common/iconmanager';
import { Role } from '../../../lib/role';
import { Sponsor } from '../../../lib/sponsor';
import { TournamentRepository } from '../../../lib/tournament/repository';
import { NavBarTournamentTVViewLink } from '../../../nav/nav.component';
import { TournamentComponent } from '../component';

@Component({
    selector: 'app-tournament-view-tv',
    templateUrl: './tv.component.html',
    styleUrls: ['./tv.component.scss']
})
export class TournamentViewTvComponent extends TournamentComponent implements OnInit, OnDestroy {

    private timerSubscription: Subscription;
    ranking: Ranking;
    public planningService: PlanningService;
    screenDef: any;
    private maxLines = 8;

    constructor(
        route: ActivatedRoute,
        router: Router,
        private authService: AuthService,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private globalEventsManager: GlobalEventsManager,
        public iconManager: IconManager,
        public nameService: NameService
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
        this.planningService = new PlanningService(this.tournament.getCompetition());
        const screenDefs = this.getScreenDefinitions(this.structure.getFirstRoundNumber());
        if (screenDefs.length === 0) {
            this.setAlert('info', 'op dit moment zijn er geen schermen om weer te geven');
            this.processing = false;
            return;
        }
        this.timerSubscription = timer(0, 10000).subscribe(number => {
            this.screenDef = screenDefs.shift();
            this.processing = false;
            if (this.screenDef === undefined) {
                this.timerSubscription.unsubscribe();
                this.processing = true;
                this.getDataAndProcessScreens();
            }
        });
    }

    getDataAndProcessScreens() {
        this.setData(this.tournament.getId(), () => { this.processScreens(); });
    }

    getScreenDefinitions(firstRoundNumber: RoundNumber): ScreenDefinition[] {
        const lastPlayedRoundNumber = this.getLastPlayedRoundNumber(firstRoundNumber);
        const nextRoundNumber = lastPlayedRoundNumber !== undefined ? lastPlayedRoundNumber.getNext() : firstRoundNumber;
        const stateNextRoundNumber = nextRoundNumber !== undefined ? this.getStateRoundNumber(nextRoundNumber) : undefined;

        let roundNumberForScheduleAndRanking;
        let previousPlayedRoundNumber;
        if (lastPlayedRoundNumber === undefined) { // voor het begin
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
        if (previousPlayedRoundNumber !== undefined) {
            screenDefs = screenDefs.concat(this.getScreenDefinitionsForResultsAndRanking(previousPlayedRoundNumber));
        }
        if (this.tournament.getSponsors().length > 0) {
            screenDefs = screenDefs.concat(this.getScreenDefinitionsForSponsors(previousPlayedRoundNumber));
        }

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
    getScreenDefinitionsForScheduleAndRanking(roundNumber: RoundNumber): ScreenDefinition[] {
        const screenDefs: ScreenDefinition[] = [];
        const games: Game[] = this.getScheduledGamesForRoundNumber(roundNumber);

        const rankingScreenDefs = this.getScreenDefinitionsForRanking(roundNumber, this.getPoulesForRanking(roundNumber));
        const roundsDescription = this.nameService.getRoundNumberName(roundNumber);
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
    getScheduledGamesForRoundNumber(roundNumber: RoundNumber): Game[] {
        let games: Game[] = this.planningService.getGamesForRoundNumber(roundNumber, Game.ORDER_RESOURCEBATCH);
        games = games.filter(game => game.getState() !== Game.STATE_PLAYED &&
            (!roundNumber.getConfig().getEnableTime() || game.getStartDateTime() > new Date())
        );
        if (games.length > this.maxLines) {
            return games.splice(0, this.maxLines);
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

    /**
     * show poules which needs ranking
     */
    getScreenDefinitionsForRanking(roundNumber: RoundNumber, poules: Poule[]): ScreenDefinition[] {
        const screenDefs: ScreenDefinition[] = [];
        const twoPoules: Poule[] = [];
        const poulesForRanking = this.getPoulesForRanking(roundNumber);
        const roundsDescription = this.nameService.getRoundNumberName(roundNumber);
        poulesForRanking.forEach(poule => {
            twoPoules.push(poule);
            if (twoPoules.length < 2) {
                return;
            }
            screenDefs.push(new PoulesRankingScreenDefinition(roundNumber, twoPoules.shift(), twoPoules.shift(), roundsDescription));
        });
        if (twoPoules.length === 1) {
            screenDefs.push(new PoulesRankingScreenDefinition(roundNumber, twoPoules.shift(), undefined, roundsDescription));
        }
        return screenDefs;
    }

    getScreenDefinitionsForResultsAndRanking(roundNumber: RoundNumber): ScreenDefinition[] {
        const poulesForRanking = this.getPoulesForRanking(roundNumber);
        const screenDefs: ScreenDefinition[] = this.getScreenDefinitionsForRanking(roundNumber, poulesForRanking);
        const poulesForResults = this.getPoules(roundNumber).filter(poule => {
            return !poulesForRanking.some(pouleForRanking => pouleForRanking === poule);
        });
        // loop door de poules die wedstrijden moeten tonen( deze poules eerst samenvoegen)
        const games: Game[] = this.getResultsForRoundPoules(poulesForResults);
        if (games.length > 0) {
            const roundsDescription = this.nameService.getRoundNumberName(roundNumber);
            screenDefs.push(new PlayedGamesScreenDefinition(roundNumber, games, roundsDescription));
        }
        return screenDefs;
    }

    getScreenDefinitionsForSponsors(roundNumber: RoundNumber): ScreenDefinition[] {
        const screenDefs: ScreenDefinition[] = [];
        const sponsors = this.tournament.getSponsors().slice();
        while (sponsors.length > 0) {
            screenDefs.push(new SponsorScreenDefinition(roundNumber, sponsors.splice(0, this.maxLines)));
        }
        return screenDefs;
    }

    getScreenDefinitionsForEndRanking(roundNumber: RoundNumber): ScreenDefinition[] {
        const screenDefs: ScreenDefinition[] = [];
        const endRankingService = new EndRanking(Ranking.RULESSET_WC);
        const rankingItems = endRankingService.getItems(this.structure.getRootRound());
        while (rankingItems.length > 0) {
            screenDefs.push(new EndRankingScreenDefinition(roundNumber, rankingItems.splice(0, this.maxLines)));
        }
        return screenDefs;
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

    protected getLastPlayedRoundNumber(roundNumber: RoundNumber): RoundNumber {
        const played = this.isRoundNumberPlayed(roundNumber);
        if (played) {
            if (!roundNumber.hasNext() || !this.isRoundNumberPlayed(roundNumber.getNext())) {
                return roundNumber;
            }
            return this.getLastPlayedRoundNumber(roundNumber.getNext());
        }
        if (roundNumber.isFirst()) {
            return undefined;
        }
        return this.getLastPlayedRoundNumber(roundNumber.getPrevious());
    }

    isRoundNumberPlayed(roundNumber: RoundNumber): boolean {
        return !roundNumber.getRounds().some(round => round.getState() !== Game.STATE_PLAYED);
    }

    getStateRoundNumber(roundNumber: RoundNumber): number {
        /*if (roundNumber.getRounds().length === 0) {
            return Game.STATE_PLAYED;
        }*/
        const inplay = roundNumber.getRounds().some(round => round.getState() !== Game.STATE_CREATED);
        if (inplay !== true) {
            return Game.STATE_CREATED;
        }
        return Game.STATE_INPLAY;
    }

    ngOnDestroy() {
        this.globalEventsManager.toggleTVIconInNavBar.emit({});
        if (this.timerSubscription !== undefined) {
            this.timerSubscription.unsubscribe();
        }
    }

    isAdmin(): boolean {
        return this.tournament.hasRole(this.authService.getLoggedInUserId(), Role.ADMIN);
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
        const finalScore = game.getFinalScore();
        if (finalScore === undefined) {
            return sScore;
        }
        return finalScore.getHome() + sScore + finalScore.getAway();
    }

    getRankingItems(poule: Poule): RankingItem[] {
        return this.ranking.getItems(poule.getPlaces(), poule.getGames());
    }

    getUnitDifference(poulePlace: PoulePlace, games: Game[]) {
        const nrOfUnitsScored = this.ranking.getNrOfUnitsScored(poulePlace, games);
        const nrOfUnitsReceived = this.ranking.getNrOfUnitsReceived(poulePlace, games);
        return (nrOfUnitsScored - nrOfUnitsReceived) + ' ( ' + nrOfUnitsScored + ' - ' + nrOfUnitsReceived + ' )';
    }

    getClassPostfix(winnersOrLosers: number): string {
        return winnersOrLosers === Round.WINNERS ? 'success' : (winnersOrLosers === Round.LOSERS ? 'danger' : '');
    }

    getQualificationClass(poule: Poule, poulePlaceNumber: number): {} {
        const poulePlace: PoulePlace = poule.getPlace(poulePlaceNumber);
        const rules = poulePlace.getToQualifyRules();
        if (rules.length === 2) {
            return { icon: 'circle', text: 'text-warning' };
        } else if (rules.length === 1) {
            const qualifyRule = rules[0];
            const singleColor = this.getClassPostfix(qualifyRule.getWinnersOrLosers());
            return { icon: 'circle', text: 'text-' + (qualifyRule.isMultiple() ? 'warning' : singleColor) };
        }
        return { icon: undefined, text: '' };
    }
}

export class ScreenDefinition {


    constructor(public roundNumber: RoundNumber) {

    }
}

export class PoulesRankingScreenDefinition extends ScreenDefinition {
    private pouleOne: Poule;
    private pouleTwo: Poule;
    private description: string;

    constructor(roundNumber: RoundNumber, pouleOne: Poule, pouleTwo: Poule, roundsDescription: string) {
        super(roundNumber);
        this.pouleOne = pouleOne;
        this.pouleTwo = pouleTwo;
        this.description = 'stand - ' + roundsDescription;
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
        return this.description;
    }
}

export class EndRankingScreenDefinition extends ScreenDefinition {
    private items: RankingItem[];

    constructor(roundNumber: RoundNumber, items: RankingItem[]) {
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
    protected description: string;

    constructor(roundNumber: RoundNumber, games: Game[]) {
        super(roundNumber);
        this.games = games;
    }

    getGames(): Game[] {
        return this.games;
    }

    getDescription() {
        return this.description;
    }
}

export interface IGamesScreenDefinition {
    isScheduled(): boolean;
}

export class ScheduledGamesScreenDefinition extends GamesScreenDefinition implements IGamesScreenDefinition {

    constructor(roundNumber: RoundNumber, scheduledGames: Game[], roundsDescription: string) {
        super(roundNumber, scheduledGames);
        this.description = 'programma - ' + roundsDescription;
    }

    isScheduled(): boolean {
        return true;
    }
}

export class PlayedGamesScreenDefinition extends GamesScreenDefinition implements IGamesScreenDefinition {
    playedGames: Game[];

    constructor(roundNumber: RoundNumber, playedGames: Game[], roundsDescription: string) {
        super(roundNumber, playedGames);
        this.description = 'uitslagen - ' + roundsDescription;
    }

    isScheduled(): boolean {
        return false;
    }
}


export class SponsorScreenDefinition extends ScreenDefinition {
    private sponsors: Sponsor[]; // max 8

    constructor(roundNumber: RoundNumber, sponsors: Sponsor[]) {
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

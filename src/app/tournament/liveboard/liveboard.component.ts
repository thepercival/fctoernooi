import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Game, NameService, PlanningService, Poule, PoulePlace, Ranking, RoundNumber, StructureRepository } from 'ngx-sport';
import { Subscription, timer } from 'rxjs';

import { AuthService } from '../../auth/auth.service';
import { GlobalEventsManager } from '../../common/eventmanager';
import { IconManager } from '../../common/iconmanager';
import { Role } from '../../lib/role';
import { Sponsor } from '../../lib/sponsor';
import { TournamentRepository } from '../../lib/tournament/repository';
import { NavBarTournamentLiveboardLink } from '../../nav/nav.component';
import { TournamentComponent } from '../component';
import {
    EndRankingScreen,
    GamesScreen,
    PlayedGamesScreen,
    PoulesRankingScreen,
    ScheduledGamesScreen,
    Screen,
    SponsorScreen,
} from './screens';

@Component({
    selector: 'app-tournament-liveboard',
    templateUrl: './liveboard.component.html',
    styleUrls: ['./liveboard.component.scss']
})
export class TournamentLiveboardComponent extends TournamentComponent implements OnInit, OnDestroy {

    private timerSubscription: Subscription;
    public planningService: PlanningService;
    public activeScreen: any;
    public ranking: Ranking;
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
        const link: NavBarTournamentLiveboardLink = { showIcon: false, tournamentId: this.tournament.getId(), link: 'wim' };
        this.globalEventsManager.toggleLiveboardIconInNavBar.emit(link);
        this.planningService = new PlanningService(this.tournament.getCompetition());
        const screens = this.getScreens(this.structure.getFirstRoundNumber());
        if (screens.length === 0) {
            this.setAlert('info', 'op dit moment zijn er geen schermen om weer te geven');
            this.processing = false;
            return;
        }
        this.timerSubscription = timer(0, 10000).subscribe(number => {
            this.activeScreen = screens.shift();
            this.processing = false;
            if (this.activeScreen === undefined) {
                this.timerSubscription.unsubscribe();
                this.processing = true;
                this.getDataAndProcessScreens();
            }
        });
    }

    getDataAndProcessScreens() {
        this.setData(this.tournament.getId(), () => { this.processScreens(); });
    }

    getScreens(firstRoundNumber: RoundNumber): Screen[] {
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

        let screens: Screen[] = [];
        if (roundNumberForScheduleAndRanking !== undefined) {
            screens = screens.concat(this.getScreensForScheduleAndRanking(roundNumberForScheduleAndRanking));
        } else {
            screens = screens.concat(this.getScreensForEndRanking(previousPlayedRoundNumber));
        }
        if (previousPlayedRoundNumber !== undefined) {
            screens = screens.concat(this.getScreensForResultsAndRanking(previousPlayedRoundNumber));
        }
        if (this.tournament.getSponsors().length > 0) {
            screens = screens.concat(this.getScreensForSponsors(previousPlayedRoundNumber));
        }

        return screens;
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
    getScreensForScheduleAndRanking(roundNumber: RoundNumber): Screen[] {
        const screens: Screen[] = [];
        const games: Game[] = this.getScheduledGames(roundNumber);

        const rankingScreens = this.getScreensForRanking(roundNumber, this.getPoulesForRanking(roundNumber));
        const scheduledGamesScreen = new ScheduledGamesScreen(roundNumber, games);
        rankingScreens.forEach(rankingScreen => {
            if (games.length > 0) {
                screens.push(scheduledGamesScreen);
            }
            screens.push(rankingScreen);
        });
        if (screens.length === 0 && games.length > 0) {
            screens.push(scheduledGamesScreen);
        }
        return screens;
    }

    /**
     * show next 8 games
     */
    getScheduledGames(roundNumber: RoundNumber): Game[] {
        let games: Game[] = this.planningService.getGamesForRoundNumber(roundNumber, Game.ORDER_RESOURCEBATCH);
        games = games.filter(game => game.getState() !== Game.STATE_PLAYED &&
            (!roundNumber.getConfig().getEnableTime() || game.getStartDateTime() > new Date())
        );
        if (games.length < this.maxLines && roundNumber.hasNext()) {
            games = games.concat(this.getScheduledGames(roundNumber.getNext()));
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

    /**
     * show poules which needs ranking
     */
    private getScreensForRanking(roundNumber: RoundNumber, poules: Poule[]): Screen[] {
        const screens: Screen[] = [];
        const twoPoules: Poule[] = [];
        const poulesForRanking = this.getPoulesForRanking(roundNumber);
        const roundsDescription = this.nameService.getRoundNumberName(roundNumber);
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

    private getScreensForResultsAndRanking(roundNumber: RoundNumber): Screen[] {
        const poulesForRanking = this.getPoulesForRanking(roundNumber);
        const screens: Screen[] = this.getScreensForRanking(roundNumber, poulesForRanking);
        const poulesForResults = this.getPoules(roundNumber).filter(poule => {
            return !poulesForRanking.some(pouleForRanking => pouleForRanking === poule);
        });
        // loop door de poules die wedstrijden moeten tonen( deze poules eerst samenvoegen)
        const games: Game[] = this.getResultsForRoundPoules(poulesForResults);
        if (games.length > 0) {
            const roundsDescription = this.nameService.getRoundNumberName(roundNumber);
            screens.push(new PlayedGamesScreen(roundNumber, games, roundsDescription));
        }
        return screens;
    }

    private getScreensForSponsors(roundNumber: RoundNumber): Screen[] {
        const screens: Screen[] = [];
        const sponsors = this.tournament.getSponsors().slice();
        while (sponsors.length > 0) {
            screens.push(new SponsorScreen(roundNumber, sponsors.splice(0, this.maxLines)));
        }
        return screens;
    }

    private getScreensForEndRanking(roundNumber: RoundNumber): Screen[] {
        const screens: Screen[] = [];
        let nrOfItems = 0;
        this.structure.getRootRound().getPoules().forEach(poule => nrOfItems += poule.getPlaces().length);
        for (let currentRank = 0; currentRank + this.maxLines <= nrOfItems; currentRank += this.maxLines) {
            const endRank = currentRank + this.maxLines > nrOfItems ? nrOfItems : currentRank + this.maxLines;
            screens.push(new EndRankingScreen(roundNumber, currentRank + 1, endRank));
        }
        return screens;
    }

    private getResultsForRoundPoules(poulesForResults: Poule[]): Game[] {
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
        this.globalEventsManager.toggleLiveboardIconInNavBar.emit({});
        if (this.timerSubscription !== undefined) {
            this.timerSubscription.unsubscribe();
        }
    }

    isAdmin(): boolean {
        return this.tournament.hasRole(this.authService.getLoggedInUserId(), Role.ADMIN);
    }

    isPoulesRankingScreen(): boolean {
        return this.activeScreen instanceof PoulesRankingScreen;
    }

    isEndRankingScreen(): boolean {
        return this.activeScreen instanceof EndRankingScreen;
    }

    isGamesScreen(): boolean {
        return this.activeScreen instanceof GamesScreen;
    }

    isSponsorScreen(): boolean {
        return this.activeScreen instanceof SponsorScreen;
    }

    isScheduled(): boolean {
        return this.activeScreen instanceof ScheduledGamesScreen;
    }

    hasFields() {
        return this.tournament.getCompetition().getFields().length > 0;
    }

    hasReferees() {
        return this.tournament.getCompetition().getReferees().length > 0;
    }



    /*getRoundNumberAbbreviation( roundNumber: RoundNumber ): string {
        const name = this.nameService.getRoundNumberName(roundNumber);
        const idxSpace = name.indexOf(' ');
        return name.substring(0, idxSpace) + name.substring(idxSpace + 1, idxSpace + 2).toUpperCase();
    }*/
}



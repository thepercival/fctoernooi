import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Game, PlanningService, Poule, PoulePlace, Ranking, StructureRepository } from 'ngx-sport';
import { timer } from 'rxjs/observable/timer';
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from '../../../auth/auth.service';
import { GlobalEventsManager } from '../../../common/eventmanager';
import { IconManager } from '../../../common/iconmanager';
import { NavBarTournamentTVViewLink } from '../../../nav/nav.component';
import { TournamentComponent } from '../component';
import { TournamentRepository } from '../repository';
import { TournamentRole } from '../role';

@Component({
    selector: 'app-tournament-view-tv',
    templateUrl: './tv.component.html',
    styleUrls: ['./tv.component.css']
})
export class TournamentViewTvComponent extends TournamentComponent implements OnInit, OnDestroy {

    private timerSubscription: Subscription;
    ranking: Ranking;
    private planningService: PlanningService;
    screenDef: ScreenDefinition;

    constructor(
        route: ActivatedRoute,
        router: Router,
        private authService: AuthService,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private globalEventsManager: GlobalEventsManager,
        private iconManager: IconManager
    ) {
        super(route, router, tournamentRepository, structureRepository);
        this.ranking = new Ranking(Ranking.RULESSET_WC);
    }

    ngOnInit() {
        super.myNgOnInit(() => this.postSetDataEventInit());
    }

    postSetDataEventInit() {
        this.postSetDataEvent();
        this.showScreens(false);
    }

    postSetDataEvent() {
        const link: NavBarTournamentTVViewLink = { showTVIcon: false, tournamentId: this.tournament.getId(), link: '/toernooi/view' };
        this.globalEventsManager.toggleTVIconInNavBar.emit(link);
        this.planningService = new PlanningService(this.structureService);
    }

    showScreens(getData: boolean) {
        if (getData === true) {
            this.setData(this.tournament.getId(), () => this.postSetDataEvent());
        }
        const screenDefs = this.getScreenDefinitions();
        this.screenDef = screenDefs.shift();

        this.timerSubscription = timer(10000, 10000).subscribe(number => {
            this.screenDef = screenDefs.shift();
            if (this.screenDef === undefined) {
                this.timerSubscription.unsubscribe();
                this.showScreens(true);
            }
        });
    }

    getScreenDefinitions(): ScreenDefinition[] {
        const lastPlayedRoundNumber = this.getLastPlayedRoundNumber();
        const nextRoundNumber = lastPlayedRoundNumber + 1;
        const stateNextRoundNumber = this.getStateRoundNumber(nextRoundNumber);
        let roundNumberForScheduleAndRanking = nextRoundNumber;
        let roundNumberForRanking;

        if (lastPlayedRoundNumber === 0) { // voor het begin
            // programma volgende ronde
        } else if (stateNextRoundNumber === Game.STATE_CREATED) { // tussen twee ronden in
            // alleen poules van afgelopen ronde tonen als die er zijn
            roundNumberForRanking = lastPlayedRoundNumber;
            // en programma volgende ronde.
        } else if (stateNextRoundNumber === Game.STATE_INPLAY) { // tijdens een ronde
            // programma volgende ronde.
        } else if (stateNextRoundNumber === Game.STATE_PLAYED) { // na het einde
            roundNumberForScheduleAndRanking--; // programma laatste ronde
        }

        let screenDefs: ScreenDefinition[] = [];
        screenDefs = screenDefs.concat(this.getScreenDefinitionsForScheduleAndRanking(roundNumberForScheduleAndRanking));
        if (roundNumberForRanking !== undefined) {
            screenDefs = screenDefs.concat(this.getScreenDefinitionsForRanking(roundNumberForRanking, false));
        }
        return screenDefs;
    }

    /**
     * show next 8 games, show rankings
     */
    getScreenDefinitionsForScheduleAndRanking(roundNumber: number): ScreenDefinition[] {
        const screenDefs: ScreenDefinition[] = [];

        const rankingScreenDefs = this.getScreenDefinitionsForRanking(roundNumber, true);
        const scheduledGamesScreenDef = this.getScreenDefinitionForSchedule(roundNumber);
        screenDefs.push(scheduledGamesScreenDef);
        rankingScreenDefs.forEach(rankingScreenDef => {
            screenDefs.push(scheduledGamesScreenDef);
            screenDefs.push(rankingScreenDef);
        });
        if (screenDefs.length === 0) {
            screenDefs.push(scheduledGamesScreenDef);
        }
        return screenDefs;
    }

    /**
     * show next 8 games
     */
    getScreenDefinitionForSchedule(roundNumber: number): ScreenDefinition {
        const allRoundsByNumber = this.structureService.getAllRoundsByNumber();
        const roundsByNumber = allRoundsByNumber[roundNumber];

        let games: Game[] = [];
        const gamesByNumber = this.planningService.getGamesByNumber(roundNumber, Game.ORDER_RESOURCEBATCH);
        gamesByNumber.forEach(gamesIt => gamesIt.forEach(game => games.push(game)));

        games = games.filter(game => {
            return game.getState() !== Game.STATE_PLAYED;
        });
        return new ScheduledGamesScreenDefinition(roundNumber, games.slice(0, 8));
    }

    /**
     * show poules which needs ranking, optional: at least one competitor has two games played
     */
    getScreenDefinitionsForRanking(roundNumber: number, twoGamesCheck: boolean): ScreenDefinition[] {
        const screenDefs: ScreenDefinition[] = [];
        let pouleTmp: Poule;
        const allRoundsByNumber = this.structureService.getAllRoundsByNumber();
        const roundsByNumber = allRoundsByNumber[roundNumber];
        roundsByNumber.forEach(round => {
            round.getPoules().forEach(poule => {
                if (twoGamesCheck === true && !this.hasPouleAPlaceWithTwoGamesPlayed(poule)) {
                    return;
                }
                if (pouleTmp === undefined) {
                    pouleTmp = poule;
                    return;
                }
                screenDefs.push(new RankingScreenDefinition(roundNumber, pouleTmp, poule));
                pouleTmp = undefined;
            });
        });
        if (pouleTmp !== undefined) {
            screenDefs.push(new RankingScreenDefinition(roundNumber, pouleTmp));
        }
        return screenDefs;
    }

    hasPouleAPlaceWithTwoGamesPlayed(poule: Poule): boolean {
        return poule.getPlaces().some((place: PoulePlace) => this.ranking.getNrOfGamesWithState(place, place.getGames()) > 1);
    }

    getLastPlayedRoundNumber(roundNumber: number = 1): number {
        const allRoundsByNumber = this.structureService.getAllRoundsByNumber();
        const roundsByNumber = allRoundsByNumber[roundNumber];
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
        const allRoundsByNumber = this.structureService.getAllRoundsByNumber();
        const roundsByNumber = allRoundsByNumber[roundNumber];
        if (roundsByNumber === undefined) {
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

    isRankingScreenDef(): boolean {
        return this.screenDef instanceof RankingScreenDefinition;
    }

    isScheduledGamesScreenDef(): boolean {
        return this.screenDef instanceof ScheduledGamesScreenDefinition;
    }

    hasReferees() {
        return this.tournament.getCompetitionseason().getReferees().length > 0;
    }

    getScore(game: Game): string {
        const sScore = ' - ';
        if (game.getState() !== Game.STATE_PLAYED) {
            return sScore;
        }
        return game.getFinalScore().getHome() + sScore + game.getFinalScore().getAway();
    }

    getPoulePlacesByRank(poule: Poule): PoulePlace[][] {
        return this.ranking.getPoulePlacesByRank(poule.getPlaces(), poule.getGames());
    }
}

export class ScreenDefinition {
    roundNumber: number;

    constructor(roundNumber: number) {
        this.roundNumber = roundNumber;
    }
}

export class RankingScreenDefinition extends ScreenDefinition {
    private pouleOne: Poule;
    private pouleTwo: Poule;

    constructor(roundNumber: number, pouleOne: Poule, pouleTwo?: Poule) {
        super(roundNumber);
        this.pouleOne = pouleOne;
        this.pouleTwo = pouleTwo;
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

export class ScheduledGamesScreenDefinition extends ScreenDefinition {
    private scheduledGames: Game[]; // max 8

    constructor(roundNumber: number, scheduledGames) {
        super(roundNumber);
        this.scheduledGames = scheduledGames;
    }

    getScheduledGames(): Game[] {
        return this.scheduledGames;
    }

    getDescription() {
        return 'programma';
    }
}

export class PlayedGamesScreenDefinition extends ScreenDefinition {
    playedGames: Game[]; // max 8

    constructor(roundNumber: number, ) {
        super(roundNumber);
    }

    getDescription() {
        return 'uitslagen';
    }
}

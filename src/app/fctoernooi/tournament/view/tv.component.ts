import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Game, PlanningService, Poule, PoulePlace, Ranking, StructureRepository } from 'ngx-sport';
import { timer } from 'rxjs/observable/timer';
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from '../../../auth/auth.service';
import { GlobalEventsManager } from '../../../common/eventmanager';
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
    private ranking: Ranking;
    private planningService: PlanningService;

    constructor(
        route: ActivatedRoute,
        router: Router,
        private authService: AuthService,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private globalEventsManager: GlobalEventsManager
    ) {
        super(route, router, tournamentRepository, structureRepository);
        this.ranking = new Ranking(Ranking.RULESSET_WC);
    }

    ngOnInit() {
        super.myNgOnInit(() => this.initTVViewLink());

        doe een oneindige cycle van:
        1 data ophalen
        2 schermdefinities zetten
        3 door schermdefinities lopen


        this.timerSubscription = timer(10000, 10000).subscribe(number => {
            // this.setData(this.tournament.getId());
            // this.planningService = new PlanningService(this.structureService);
            getScreenDefinitions()
        });





        // na iteratie weer even setdata doen!!
    }

    getScreenDefinitions(): ScreenDefinition[] {
        // mySprite instanceof Sprite;

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
        rankingScreenDefs.forEach(rankingScreenDef => {
            screenDefs.push(scheduledGamesScreenDef);
            screenDefs.push(rankingScreenDef);
        });
        return screenDefs;
    }

    /**
     * show next 8 games
     */
    getScreenDefinitionForSchedule(roundNumber: number): ScreenDefinition {
        const allRoundsByNumber = this.structureService.getAllRoundsByNumber();
        const roundsByNumber = allRoundsByNumber[roundNumber];

        const games: Game[] = [];
        const gamesByNumber = this.planningService.getGamesByNumber(roundNumber);
        gamesByNumber.forEach(gamesIt => gamesIt.forEach(game => games.push(game)));

        games.filter(game => {
            return game.getState() !== Game.STATE_PLAYED;
        });
        return new ScheduledGamesScreenDefinition(games.slice(0, 8));
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
                screenDefs.push(new RankingScreenDefinition(pouleTmp, poule));
                pouleTmp = undefined;
            });
        });
        if (pouleTmp !== undefined) {
            screenDefs.push(new RankingScreenDefinition(pouleTmp));
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


    initTVViewLink() {
        const link: NavBarTournamentTVViewLink = { showTVIcon: false, tournamentId: this.tournament.getId(), link: '/toernooi/view' };
        this.globalEventsManager.toggleTVIconInNavBar.emit(link);
    }

    ngOnDestroy() {
        this.globalEventsManager.toggleTVIconInNavBar.emit({});
        this.timerSubscription.unsubscribe();
    }

    isAdmin(): boolean {
        return this.tournament.hasRole(this.authService.getLoggedInUserId(), TournamentRole.ADMIN);
    }
}

export class ScreenDefinition {

}

export class RankingScreenDefinition extends ScreenDefinition {
    private pouleOne: Poule;
    private pouleTwo: Poule;

    constructor(pouleOne: Poule, pouleTwo?: Poule) {
        super();
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
}

export class ScheduledGamesScreenDefinition extends ScreenDefinition {
    private scheduledGames: Game[]; // max 8

    constructor(scheduledGames) {
        super();
        this.scheduledGames = scheduledGames;
    }

    getScheduledGames(): Game[] {
        return this.scheduledGames;
    }
}

export class PlayedGamesScreenDefinition extends ScreenDefinition {
    playedGames: Game[]; // max 8

    constructor() {
        super();
    }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NameService, PlanningService, StructureRepository } from 'ngx-sport';

import { GlobalEventsManager } from '../../common/eventmanager';
import { IconManager } from '../../common/iconmanager';
import { MyNavigation } from '../../common/navigation';
import { Liveboard } from '../../lib/liveboard';
import { EndRankingScreen, GamesScreen, PoulesRankingScreen, SponsorScreen } from '../../lib/liveboard/screens';
import { TournamentRepository } from '../../lib/tournament/repository';
import { NavBarTournamentLiveboardLink } from '../../nav/nav.component';
import { TournamentComponent } from '../component';

@Component({
    selector: 'app-tournament-liveboard',
    templateUrl: './liveboard.component.html',
    styleUrls: ['./liveboard.component.scss']
})
export class TournamentLiveboardComponent extends TournamentComponent implements OnInit, OnDestroy {

    public planningService: PlanningService;
    public activeScreen: any;
    private screens: any[] = [];
    private maxLines = 8;
    public refreshAfterSeconds = 10;
    public toggleProgress: boolean = false;
    private screenfilter: string;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private globalEventsManager: GlobalEventsManager,
        public iconManager: IconManager,
        public nameService: NameService,
        private myNavigation: MyNavigation
    ) {
        super(route, router, tournamentRepository, structureRepository);
    }

    ngOnInit() {
        this.route.queryParamMap.subscribe(params => {
            if (params.get('screenfilter') !== null) {
                this.screenfilter = params.get('screenfilter');
            }
        });

        super.myNgOnInit(() => this.processScreens());
    }

    processScreens() {
        const link: NavBarTournamentLiveboardLink = { showIcon: false, tournamentId: this.tournament.getId(), link: 'wim' };
        this.globalEventsManager.toggleLiveboardIconInNavBar.emit(link);
        this.planningService = new PlanningService(this.tournament.getCompetition());
        const liveBoard = new Liveboard(this.tournament, this.structure, this.maxLines, this.planningService);
        this.screens = liveBoard.getScreens(this.screenfilter);
        this.executeScheduledTask();
        this.processing = false;
    }

    executeScheduledTask() {
        this.activeScreen = this.screens.shift();
        // this.processing = false;
        if (this.activeScreen === undefined) {

            this.processing = true;
            this.getDataAndProcessScreens();
        } else {
            this.toggleProgress = !this.toggleProgress;
        }
    }

    getDataAndProcessScreens() {
        this.setData(this.tournament.getId(), () => { this.processScreens(); });
    }

    ngOnDestroy() {
        this.globalEventsManager.toggleLiveboardIconInNavBar.emit({});
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

    hasFields() {
        return this.tournament.getCompetition().getFields().length > 0;
    }

    navigateBack() {
        this.router.navigateByUrl(this.myNavigation.getPreviousUrl(''));
    }
}



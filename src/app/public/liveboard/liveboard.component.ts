import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { CSSService } from '../../shared/common/cssservice';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { MyNavigation } from '../../shared/common/navigation';
import { Liveboard } from '../../lib/liveboard';
import { EndRankingScreen, GamesScreen, PoulesRankingScreen, SponsorScreen } from '../../lib/liveboard/screens';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { LiveboardLink } from '../../lib/liveboard/link';
import { NameService, PlaceLocationMap } from 'ngx-sport';

@Component({
    selector: 'app-tournament-liveboard',
    templateUrl: './liveboard.component.html',
    styleUrls: ['./liveboard.component.scss']
})
export class LiveboardComponent extends TournamentComponent implements OnInit, OnDestroy {
    public activeScreen: any;
    private screens: any[] = [];
    private maxLines = 8;
    public refreshAfterSeconds = 15;
    public toggleProgress = false;
    private screenfilter: string = '';
    public nameService!: NameService;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private globalEventsManager: GlobalEventsManager,
        public cssService: CSSService,
        private myNavigation: MyNavigation
    ) {
        super(route, router, tournamentRepository, structureRepository);
    }

    ngOnInit() {
        this.route.queryParamMap.subscribe(params => {
            if (params.get('screenfilter') !== null) {
                this.screenfilter = '' + params.get('screenfilter');
            }
        });

        super.myNgOnInit(() => this.processScreens());
    }

    processScreens() {
        const link: LiveboardLink = { showIcon: false, tournamentId: this.tournament.getId(), link: 'wim' };
        this.globalEventsManager.toggleLiveboardIconInNavBar.emit(link);
        this.nameService = new NameService(new PlaceLocationMap(this.tournament.getCompetitors()));
        const liveBoard = new Liveboard(this.tournament, this.structure, this.maxLines);
        this.screens = liveBoard.getScreens(this.screenfilter);
        if (this.screens.length > 0) {
            this.executeScheduledTask();
        } else {
            this.setAlert('danger', 'voor dit toernooi zijn er geen schermen beschikbaar, pas eventueel de tijden aan');
        }
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

    getOrigin(): string {
        return location.origin;
    }

    navigateBack() {
        this.router.navigateByUrl(this.myNavigation.getPreviousUrl(''));
    }
}



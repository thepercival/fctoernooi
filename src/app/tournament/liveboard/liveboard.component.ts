import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Game, NameService, PlanningService, Poule, PoulePlace, Ranking, RoundNumber, StructureRepository } from 'ngx-sport';
import { Subscription, timer } from 'rxjs';

import { Liveboard } from '../../lib/liveboard';
import { GlobalEventsManager } from '../../common/eventmanager';
import { IconManager } from '../../common/iconmanager';
import { Role } from '../../lib/role';
import { Sponsor } from '../../lib/sponsor';
import { TournamentRepository } from '../../lib/tournament/repository';
import { NavBarTournamentLiveboardLink } from '../../nav/nav.component';
import { TournamentComponent } from '../component';
import {
    EndRankingScreen,
    Screen,
    GamesScreen,
    PlayedGamesScreen,
    PoulesRankingScreen,
    ScheduledGamesScreen,
    SponsorScreen,
} from '../../lib/liveboard/screens';

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
        const liveBoard = new Liveboard(this.tournament,this.structure,this.maxLines,this.ranking,this.planningService);        
        const screens = liveBoard.getScreens(this.structure.getFirstRoundNumber());
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

    ngOnDestroy() {
        this.globalEventsManager.toggleLiveboardIconInNavBar.emit({});
        if (this.timerSubscription !== undefined) {
            this.timerSubscription.unsubscribe();
        }
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



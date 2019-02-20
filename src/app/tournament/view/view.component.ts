import { AfterViewChecked, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { PlanningService, StructureRepository } from 'ngx-sport';

import { AuthService } from '../../auth/auth.service';
import { GlobalEventsManager } from '../../common/eventmanager';
import { Role } from '../../lib/role';
import { TournamentRepository } from '../../lib/tournament/repository';
import { NavBarTournamentLiveboardLink } from '../../nav/nav.component';
import { TournamentComponent } from '../component';
import { IPlanningScrollTo } from '../planning/view/component';

@Component({
    selector: 'app-tournament-view',
    templateUrl: './view.component.html',
    styleUrls: ['./view.component.scss']
})
export class TournamentViewComponent extends TournamentComponent implements OnInit, AfterViewChecked, OnDestroy {
    private liveboardLinkSet = false;
    public planningService: PlanningService;
    public refreshAfterSeconds = 10;
    private refreshAtCountDown = true;
    scrollTo: IPlanningScrollTo = {};
    scrollToEndRanking: string;
    userRefereeId: number;
    toggleProgress: boolean = false;
    showEndRanking: boolean;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private globalEventsManager: GlobalEventsManager,
        private authService: AuthService,
        private scrollService: ScrollToService
    ) {
        super(route, router, tournamentRepository, structureRepository);
    }

    ngOnInit() {
        super.myNgOnInit(() => {
            this.showEndRanking = this.structure.getRootRound().getNrOfPlaces() <= 20;
            this.initLiveboardLink();
            this.planningService = new PlanningService(this.tournament.getCompetition());
            this.processing = false;
            this.toggleProgress = !this.toggleProgress;
            this.tournamentRepository.getUserRefereeId(this.tournament).subscribe(
                /* happy path */ userRefereeIdRes => {
                    this.userRefereeId = userRefereeIdRes;
                },
                /* error path */ e => { this.setAlert('danger', e); }
            );
        });
        this.route.queryParamMap.subscribe(params => {
            this.scrollTo.roundNumber = params.get('scrollToRoundNumber') !== null ? +params.get('scrollToRoundNumber') : undefined;
            this.scrollTo.gameId = params.get('scrollToGameId') !== null ? +params.get('scrollToGameId') : undefined;
            this.scrollToEndRanking = params.get('scrollToId') !== null ? params.get('scrollToId') : undefined;
        });
    }

    ngAfterViewChecked() {
        if (this.processing === false && this.scrollToEndRanking !== undefined) {
            this.scrollService.scrollTo({
                target: 'endranking',
                duration: 200
            });
            this.scrollToEndRanking = undefined;
        }
    }

    executeScheduledTask() {
        if (this.refreshAtCountDown !== true) {
            return;
        }
        this.setData(this.tournament.getId(), () => {
            this.planningService = new PlanningService(this.tournament.getCompetition());
            this.toggleProgress = !this.toggleProgress;
        });
    }

    setNoRefresh(refresh: boolean) {
        this.refreshAtCountDown = refresh;
    }

    isAdmin(): boolean {
        return this.tournament.hasRole(this.authService.getLoggedInUserId(), Role.ADMIN);
    }

    initLiveboardLink() {
        if (this.liveboardLinkSet === true) {
            return;
        }
        const link: NavBarTournamentLiveboardLink = { showIcon: true, tournamentId: this.tournament.getId(), link: '/toernooi/liveboard' };
        this.globalEventsManager.toggleLiveboardIconInNavBar.emit(link);
        this.liveboardLinkSet = true;
    }

    ngOnDestroy() {
        this.globalEventsManager.toggleLiveboardIconInNavBar.emit({});
    }

    linkToStructureView() {
        this.router.navigate(['/toernooi/structureview', this.tournament.getId()],
            {
                queryParams: {
                    returnQueryParamKey: 'scrollToId',
                    returnQueryParamValue: 'endranking'
                }
            }
        );
    }
}

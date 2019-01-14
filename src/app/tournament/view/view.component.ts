import { AfterViewChecked, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { PlanningService, StructureRepository } from 'ngx-sport';
import { interval, range, Subscription, zip } from 'rxjs';

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
    private timerSubscription: Subscription;
    public refreshAfterSeconds = 60;
    private refreshAtCountDown = true;
    private favTeamIds: number[];
    private favRefereeIds: number[];
    scrollTo: IPlanningScrollTo = {};
    scrollToEndRanking: string;
    userRefereeId: number;
    progress: number;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private globalEventsManager: GlobalEventsManager,
        private authService: AuthService,
        private scrollService: ScrollToService,
    ) {
        super(route, router, tournamentRepository, structureRepository);
    }

    ngOnInit() {
        super.myNgOnInit(() => {
            this.initLiveboardLink();
            this.planningService = new PlanningService(this.tournament.getCompetition());
            this.processing = false;
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
        this.countDown();
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

    countDown() {
        const progress = range(1, this.refreshAfterSeconds).pipe();
        this.timerSubscription = zip(interval(1000), progress)
            .subscribe(fromTo => {
                this.progress = fromTo[1];
                if (this.progress === this.refreshAfterSeconds) {
                    if (this.refreshAtCountDown === true) {
                        this.setData(this.tournament.getId(), () => {
                            this.planningService = new PlanningService(this.tournament.getCompetition());
                        });
                    }
                    this.countDown();
                }
            });
    }

    setNoRefresh(refresh) {
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
        if (this.timerSubscription !== undefined) {
            this.timerSubscription.unsubscribe();
        }
    }

    getFavTeamIdsFromLocalStorage(): number[] {
        if (this.favTeamIds === undefined) {
            this.favTeamIds = this.getFavTeamIdsFromLocalStorageHelper();
        }
        return this.favTeamIds;
    }

    protected getFavTeamIdsFromLocalStorageHelper(): number[] {
        const favTeamsAsString = localStorage.getItem('favoriteteams');
        if (favTeamsAsString === null) {
            return [];
        }
        const favTeams: {} = JSON.parse(favTeamsAsString);
        if (favTeams[this.tournament.getId()] === undefined) {
            return [];
        }
        return favTeams[this.tournament.getId()];
    }


    getFavRefereeIdsFromLocalStorage(): number[] {
        if (this.favRefereeIds === undefined) {
            this.favRefereeIds = this.getFavRefereeIdsFromLocalStorageHelper();
        }
        return this.favRefereeIds;
    }

    protected getFavRefereeIdsFromLocalStorageHelper(): number[] {
        const favRefereesAsString = localStorage.getItem('favoritereferees');
        if (favRefereesAsString === null) {
            return [];
        }
        const favReferees: {} = JSON.parse(favRefereesAsString);
        if (favReferees[this.tournament.getId()] === undefined) {
            return [];
        }
        return favReferees[this.tournament.getId()];
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

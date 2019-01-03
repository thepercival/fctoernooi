import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanningService, StructureRepository } from 'ngx-sport';
import { interval, range, Subscription, zip } from 'rxjs';

import { AuthService } from '../../../auth/auth.service';
import { GlobalEventsManager } from '../../../common/eventmanager';
import { NavBarTournamentTVViewLink } from '../../../nav/nav.component';
import { TournamentComponent } from '../component';
import { IPlanningScrollTo } from '../planning/view/component';
import { TournamentRepository } from '../repository';
import { TournamentRole } from '../role';
@Component({
    selector: 'app-tournament-view',
    templateUrl: './view.component.html',
    styleUrls: ['./view.component.scss']
})
export class TournamentViewComponent extends TournamentComponent implements OnInit, OnDestroy {
    private tvViewLinkSet = false;
    public planningService: PlanningService;
    private timerSubscription: Subscription;
    public refreshAfterSeconds = 60;
    private refreshAtCountDown = true;
    private favTeamIds: number[];
    private favRefereeIds: number[];
    scrollTo: IPlanningScrollTo = {};
    userRefereeId: number;
    progress: number;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private globalEventsManager: GlobalEventsManager,
        private authService: AuthService,
    ) {
        super(route, router, tournamentRepository, structureRepository);
    }

    ngOnInit() {
        super.myNgOnInit(() => {
            this.initTVViewLink();
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
            this.scrollTo.roundNumber = +params.get('scrollToRoundNumber');
            this.scrollTo.gameId = +params.get('scrollToGameId');
        });
        this.countDown();
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
        return this.tournament.hasRole(this.authService.getLoggedInUserId(), TournamentRole.ADMIN);
    }

    initTVViewLink() {
        if (this.tvViewLinkSet === true) {
            return;
        }
        const link: NavBarTournamentTVViewLink = { showTVIcon: true, tournamentId: this.tournament.getId(), link: '/toernooi/viewtv' };
        this.globalEventsManager.toggleTVIconInNavBar.emit(link);
        this.tvViewLinkSet = true;
    }

    ngOnDestroy() {
        this.globalEventsManager.toggleTVIconInNavBar.emit({});
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


}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanningService, StructureRepository } from 'ngx-sport';
import { Subscription, timer } from 'rxjs';

import { AuthService } from '../../../auth/auth.service';
import { GlobalEventsManager } from '../../../common/eventmanager';
import { NavBarTournamentTVViewLink } from '../../../nav/nav.component';
import { TournamentComponent } from '../component';
import { TournamentRepository } from '../repository';

@Component({
    selector: 'app-tournament-view',
    templateUrl: './view.component.html',
    styleUrls: ['./view.component.css']
})
export class TournamentViewComponent extends TournamentComponent implements OnInit, OnDestroy {
    private tvViewLinkSet = false;
    private planningService: PlanningService;
    private timerSubscription: Subscription;
    private noRefresh = false;
    private favTeamIds: number[];
    private favRefereeIds: number[];
    scrollToGameId: number;
    userRefereeId: number;

    constructor(
        route: ActivatedRoute,
        router: Router,
        private authService: AuthService,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private globalEventsManager: GlobalEventsManager
    ) {
        super(route, router, tournamentRepository, structureRepository);
    }

    ngOnInit() {
        super.myNgOnInit(() => {
            this.initTVViewLink();
            this.planningService = new PlanningService(this.structureService);
            this.processing = false;
            this.tournamentRepository.getUserRefereeId(this.tournament).subscribe(
                /* happy path */ userRefereeIdRes => {
                    this.userRefereeId = userRefereeIdRes;
                },
                /* error path */ e => { this.setAlert('danger', e); }
            );
        });

        this.route.queryParamMap.subscribe(params => {
            this.scrollToGameId = +params.get('scrollToGameId');
        });

        this.timerSubscription = timer(30000, 30000).subscribe(number => {
            if (this.noRefresh !== true) {
                this.processing = true;
                this.setData(this.tournament.getId(), () => {
                    this.planningService = new PlanningService(this.structureService);
                    this.processing = false;
                });
            }
        });
    }

    setNoRefresh(toggle) {
        this.noRefresh = toggle;
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

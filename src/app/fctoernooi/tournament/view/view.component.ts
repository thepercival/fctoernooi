import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanningService, StructureRepository } from 'ngx-sport';
import { timer ,  Subscription } from 'rxjs';

import { AuthService } from '../../../auth/auth.service';
import { GlobalEventsManager } from '../../../common/eventmanager';
import { NavBarTournamentTVViewLink } from '../../../nav/nav.component';
import { TournamentComponent } from '../component';
import { TournamentRepository } from '../repository';
import { TournamentRole } from '../role';

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
    scrollToGameId: number;

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
        super.myNgOnInit(() => this.initTVViewLink());

        this.route.queryParamMap.subscribe(params => {
            this.scrollToGameId = +params.get('scrollToGameId');
        });

        this.timerSubscription = timer(10000, 10000).subscribe(number => {
            if (this.noRefresh !== true) {
                this.setData(this.tournament.getId());
                this.planningService = new PlanningService(this.structureService);
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

        this.planningService = new PlanningService(this.structureService);
    }

    ngOnDestroy() {
        this.globalEventsManager.toggleTVIconInNavBar.emit({});
        if (this.timerSubscription !== undefined) {
            this.timerSubscription.unsubscribe();
        }
    }

    isAdmin(): boolean {
        return this.tournament.hasRole(this.authService.getLoggedInUserId(), TournamentRole.ADMIN);
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
}

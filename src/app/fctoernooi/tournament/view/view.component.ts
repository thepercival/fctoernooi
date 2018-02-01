import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanningService, StructureRepository } from 'ngx-sport';
import { timer } from 'rxjs/observable/timer';
import { Subscription } from 'rxjs/Subscription';

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

        this.timerSubscription = timer(10000, 10000).subscribe(number => {
            this.setData(this.tournament.getId());
            this.planningService = new PlanningService(this.structureService);
        });
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
        this.timerSubscription.unsubscribe();
    }

    isAdmin(): boolean {
        return this.tournament.hasRole(this.authService.getLoggedInUserId(), TournamentRole.ADMIN);
    }
}

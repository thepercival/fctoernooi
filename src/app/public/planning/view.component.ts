import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../lib/auth/auth.service';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { MyNavigation } from '../../shared/common/navigation';
import { Role } from '../../lib/role';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { LiveboardLink } from '../../lib/liveboard/link';

@Component({
    selector: 'app-tournament-planning',
    templateUrl: './view.component.html',
    styleUrls: ['./view.component.scss']
})
export class PlanningComponent extends TournamentComponent implements OnInit, OnDestroy {
    private liveboardLinkSet = false;
    userRefereeId: number;
    refreshingData = false;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private globalEventsManager: GlobalEventsManager,
        private myNavigation: MyNavigation,
        private authService: AuthService
    ) {
        super(route, router, tournamentRepository, structureRepository);
    }

    ngOnInit() {
        super.myNgOnInit(() => {
            this.initLiveboardLink();
            this.tournamentRepository.getUserRefereeId(this.tournament).subscribe(
                /* happy path */ userRefereeIdRes => {
                    this.userRefereeId = userRefereeIdRes;
                    this.processing = false;
                },
                /* error path */ e => { this.setAlert('danger', e); }
            );
        });
    }

    scroll() {
        this.myNavigation.scroll();
    }

    isAdmin(): boolean {
        return this.tournament && this.tournament.hasRole(this.authService.getLoggedInUserId(), Role.ADMIN);
    }

    refreshData() {
        this.refreshingData = true;
        // set processing is true
        this.setData(this.tournament.getId(), () => {
            // set processing is false
            this.refreshingData = false;
        });
    }

    initLiveboardLink() {
        if (this.liveboardLinkSet === true) {
            return;
        }
        const link: LiveboardLink = { showIcon: true, tournamentId: this.tournament.getId(), link: '/public/liveboard' };
        this.globalEventsManager.toggleLiveboardIconInNavBar.emit(link);
        this.liveboardLinkSet = true;
    }

    ngOnDestroy() {
        this.globalEventsManager.toggleLiveboardIconInNavBar.emit({});
    }

    linkToStructureView() {
        this.router.navigate(['/public/structure', this.tournament.getId()]);
    }
}

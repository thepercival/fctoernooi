import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../auth/auth.service';
import { GlobalEventsManager } from '../../common/eventmanager';
import { MyNavigation } from '../../common/navigation';
import { Role } from '../../lib/role';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { NavBarTournamentLiveboardLink } from '../../nav/nav.component';
import { TournamentComponent } from '../component';

@Component({
    selector: 'app-tournament-view',
    templateUrl: './view.component.html',
    styleUrls: ['./view.component.scss']
})
export class ViewComponent extends TournamentComponent implements OnInit, OnDestroy {
    private liveboardLinkSet = false;
    userRefereeId: number;
    shouldShowEndRanking: boolean;
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
            this.shouldShowEndRanking = (this.structure.getFirstRoundNumber().hasNext()
                || this.structure.getRootRound().getPoules().length === 1);
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
        const link: NavBarTournamentLiveboardLink = { showIcon: true, tournamentId: this.tournament.getId(), link: '/toernooi/liveboard' };
        this.globalEventsManager.toggleLiveboardIconInNavBar.emit(link);
        this.liveboardLinkSet = true;
    }

    ngOnDestroy() {
        this.globalEventsManager.toggleLiveboardIconInNavBar.emit({});
    }

    linkToStructureView() {
        this.router.navigate(['/toernooi/structureview', this.tournament.getId()]);
    }
}

import { NavBarTournamentTVViewLink } from '../../../nav/nav.component';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StructureRepository } from 'ngx-sport';

import { AuthService } from '../../../auth/auth.service';
import { TournamentComponent } from '../component';
import { TournamentRepository } from '../repository';
import { TournamentRole } from '../role';
import { GlobalEventsManager } from '../../../common/eventmanager';

@Component({
    selector: 'app-tournament-view-tv',
    templateUrl: './tv.component.html',
    styleUrls: ['./tv.component.css']
})
export class TournamentViewTvComponent extends TournamentComponent implements OnInit, OnDestroy {

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
    }

    initTVViewLink() {
        const link: NavBarTournamentTVViewLink = { showTVIcon: false, tournamentId: this.tournament.getId(), link: '/toernooi/view' };
        this.globalEventsManager.toggleTVIconInNavBar.emit(link);
    }

    ngOnDestroy() {
        this.globalEventsManager.toggleTVIconInNavBar.emit({});
    }

    isAdmin(): boolean {
        return this.tournament.hasRole(this.authService.getLoggedInUserId(), TournamentRole.ADMIN);
    }
}

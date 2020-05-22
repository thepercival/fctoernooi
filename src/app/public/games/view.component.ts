import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../lib/auth/auth.service';
import { MyNavigation } from '../../shared/common/navigation';
import { Role } from '../../lib/role';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';

@Component({
    selector: 'app-tournament-games-view',
    templateUrl: './view.component.html',
    styleUrls: ['./view.component.scss']
})
export class GamesComponent extends TournamentComponent implements OnInit {
    userRefereeId: number;
    refreshingData = false;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private myNavigation: MyNavigation,
        private authService: AuthService
    ) {
        super(route, router, tournamentRepository, structureRepository);
    }

    ngOnInit() {
        super.myNgOnInit(() => {
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
        this.setData(this.tournament.getId(), () => {
            this.myNavigation.updateScrollPosition();
            this.refreshingData = false;
        });
    }

    linkToStructureView() {
        this.router.navigate(['/public/structure', this.tournament.getId()]);
    }
}

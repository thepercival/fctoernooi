import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../lib/auth/auth.service';
import { MyNavigation } from '../../shared/common/navigation';
import { Role } from '../../lib/role';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { FavoritesRepository } from '../../lib/favorites/repository';

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
        private authService: AuthService,
        public favRepository: FavoritesRepository
    ) {
        super(route, router, tournamentRepository, structureRepository);
    }

    ngOnInit() {
        super.myNgOnInit(() => {
            const tournamentUser = this.tournament.getUser(this.authService.getUser());
            if (tournamentUser && tournamentUser.hasRoles(Role.REFEREE)) {
                this.tournamentRepository.getUserRefereeId(this.tournament).subscribe(
                    /* happy path */ userRefereeIdRes => {
                        this.userRefereeId = userRefereeIdRes;
                        this.processing = false;
                    },
                    /* error path */ e => { this.setAlert('danger', e); }
                );
            } else {
                this.processing = false;
            }
        });
    }

    scroll() {
        this.myNavigation.scroll();
    }

    isAdmin(): boolean {
        return this.tournament.getUser(this.authService.getUser())?.hasRoles(Role.GAMERESULTADMIN);
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

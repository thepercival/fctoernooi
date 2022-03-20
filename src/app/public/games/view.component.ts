import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../lib/auth/auth.service';
import { MyNavigation } from '../../shared/common/navigation';
import { Role } from '../../lib/role';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { TournamentUser } from '../../lib/tournament/user';
import { Observable, of } from 'rxjs';

@Component({
    selector: 'app-tournament-games-view',
    templateUrl: './view.component.html',
    styleUrls: ['./view.component.scss']
})
export class GamesComponent extends TournamentComponent implements OnInit {
    userRefereeId: number | string | undefined;
    roles: number = 0;
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
            const loggedInUserId = this.authService.getLoggedInUserId();
            const tournamentUser = loggedInUserId ? this.tournament.getUser(loggedInUserId) : undefined;
            if (tournamentUser && tournamentUser.hasRoles(Role.REFEREE)) {
                this.roles = tournamentUser.getRoles();
                this.tournamentRepository.getUserRefereeId(this.tournament)
                    .subscribe({
                        next: (userRefereeId: number | string) => {
                            this.userRefereeId = userRefereeId;
                            this.processing = false;
                        },
                        error: (e) => this.processing = false
                    });
            } else {
                this.processing = false;
            }
        });
    }

    filterRefereeRole(): number {
        return this.roles & Role.REFEREE;
    }

    scroll() {
        this.myNavigation.scroll();
    }

    isAdmin(): boolean {
        return this.hasRole(this.authService, Role.ADMIN);
    }

    refreshData() {
        this.refreshingData = true;
        this.setData(this.tournament.getId(), () => {
            this.myNavigation.updateScrollPosition();
            this.refreshingData = false;
        });
    }
}

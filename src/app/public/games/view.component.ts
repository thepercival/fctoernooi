import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../lib/auth/auth.service';
import { MyNavigation } from '../../shared/common/navigation';
import { Role } from '../../lib/role';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { Category, StartLocationMap, StructureNameService } from 'ngx-sport';
import { Favorites } from '../../lib/favorites';
import { TournamentScreen } from '../../shared/tournament/screenNames';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-tournament-games-view',
    templateUrl: './view.component.html',
    styleUrls: ['./view.component.scss']
})
export class GamesComponent extends TournamentComponent implements OnInit {
    userRefereeId: number | string | undefined;
    roles: number = 0;
    public structureNameService!: StructureNameService;
    refreshingData = false;
    public favorites!: Favorites;
    public categoryMap: Map<number, Category> = new Map();

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        globalEventsManager: GlobalEventsManager,
        modalService: NgbModal,
        favRepository: FavoritesRepository,
        private myNavigation: MyNavigation,
        private authService: AuthService,
    ) {
        super(route, router, tournamentRepository, structureRepository, globalEventsManager, modalService, favRepository);
    }

    ngOnInit() {
        super.myNgOnInit(() => {
            const loggedInUserId = this.authService.getLoggedInUserId();
            const tournamentUser = loggedInUserId ? this.tournament.getUser(loggedInUserId) : undefined;
            const startLocationMap = new StartLocationMap(this.tournament.getCompetitors());
            this.structureNameService = new StructureNameService(startLocationMap);
            this.updateFavoriteCategories(this.structure);
            this.favorites = this.favRepository.getObject(this.tournament, this.structure.getCategories());
            if (tournamentUser && tournamentUser.hasRoles(Role.Referee)) {
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

    get GamesScreen(): TournamentScreen { return TournamentScreen.Games }

    filterRefereeRole(): number {
        return this.roles & Role.Referee;
    }

    scroll() {
        this.myNavigation.scroll();
    }

    isAdmin(): boolean {
        return this.hasRole(this.authService, Role.Admin);
    }

    refreshData() {
        this.refreshingData = true;
        this.setData(this.tournament.getId(), () => {
            this.myNavigation.updateScrollPosition();
            this.refreshingData = false;
        });
    }
}

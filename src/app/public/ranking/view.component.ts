import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { AgainstRuleSet, Category, GameState, StartLocationMap, Structure, StructureNameService } from 'ngx-sport';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { AuthService } from '../../lib/auth/auth.service';
import { Role } from '../../lib/role';
import { TournamentMapper } from '../../lib/tournament/mapper';
import { Tournament } from '../../lib/tournament';
import { Favorites } from '../../lib/favorites';
import { IAlertType } from '../../shared/common/alert';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { TournamentScreen } from '../../shared/tournament/screenNames';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WebsitePart } from '../../shared/tournament/structure/admin-public-switcher.component';

@Component({
    selector: 'app-tournament-ranking-view',
    templateUrl: './view.component.html',
    styleUrls: ['./view.component.scss']
})
export class RankingViewComponent extends TournamentComponent implements OnInit {
    public favorites!: Favorites;
    public structureNameService!: StructureNameService;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        globalEventsManager: GlobalEventsManager,
        modalService: NgbModal,
        favRepository: FavoritesRepository,
        protected tournamentMapper: TournamentMapper,
        protected authService: AuthService
    ) {
        super(route, router, tournamentRepository, structureRepository, globalEventsManager, modalService, favRepository);
    }

    ngOnInit() {
        super.myNgOnInit(() => {
            this.updateFavoriteCategories(this.structure);
            const startLocationMap = new StartLocationMap(this.tournament.getCompetitors());
            this.structureNameService = new StructureNameService(startLocationMap);
            this.favorites = this.favRepository.getObject(this.tournament, this.structure.getCategories());

            this.processing = false;
        });
    }

    get RankingScreen(): TournamentScreen { return TournamentScreen.Ranking }
    get PublicWebsitePart(): WebsitePart { return WebsitePart.Public } 

    isAdmin(): boolean {
        return this.hasRole(this.authService, Role.Admin);
    }
}

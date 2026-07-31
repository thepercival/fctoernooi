import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { AgainstRuleSet, Category, GameState, StartLocationMap, Structure, StructureNameService } from 'ngx-sport';
import { AuthService } from '../../lib/auth/auth.service';
import { Role } from '../../lib/role';
import { TournamentMapper } from '../../lib/tournament/mapper';
import { Tournament } from '../../lib/tournament';
import { Favorites } from '../../lib/favorites';
import { IAlertType } from '../../shared/common/alert';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { TournamentScreen } from '../../shared/tournament/screenNames';
import { WebsitePart } from '../../shared/tournament/structure/admin-public-switcher.component';
import { AdminPublicSwitcherComponent } from '../../shared/tournament/structure/admin-public-switcher.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { RankingCategoryComponent } from '../../shared/tournament/ranking/category.component';
import { TournamentNavBarComponent } from '../../shared/tournament/tournamentNavBar/tournamentNavBar.component';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-tournament-ranking-view',
    templateUrl: './view.component.html',
    styleUrls: ['./view.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [AdminPublicSwitcherComponent, FontAwesomeModule, NgbAlert, RankingCategoryComponent, TournamentNavBarComponent]
    
})
export class RankingViewComponent extends TournamentComponent implements OnInit {
    faSpinner = faSpinner;
    public favorites!: Favorites;
    public structureNameService!: StructureNameService;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        globalEventsManager: GlobalEventsManager,
        protected tournamentMapper: TournamentMapper,
        protected authService: AuthService
    ) {
        super(route, router, tournamentRepository, structureRepository, globalEventsManager);
    }

    ngOnInit() {
        super.myNgOnInit(() => {
            this.updateFavoriteCategories(this.structure);
            const startLocationMap = new StartLocationMap(this.tournament.getCompetitors());
            this.structureNameService = new StructureNameService(startLocationMap);
            this.favorites = this.favRepository.getObject(this.tournament, this.structure.getCategories());

            this.processing.set(false);
        });
    }

    get RankingScreen(): TournamentScreen { return TournamentScreen.Ranking }
    get PublicWebsitePart(): WebsitePart { return WebsitePart.Public } 

    isAdmin(): boolean {
        return this.authService.loggedInUserHasRole(this.tournament, Role.Admin);
    }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Referee, Structure, Category, StructureNameService, StartLocationMap } from 'ngx-sport';

import { MyNavigation } from '../../shared/common/navigation';
import { Favorites } from '../../lib/favorites';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { AuthService } from '../../lib/auth/auth.service';
import { Role } from '../../lib/role';
import { IAlertType } from '../../shared/common/alert';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { TournamentScreen } from '../../shared/tournament/screenNames';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-tournament-select-favorites',
    templateUrl: './select.component.html',
    styleUrls: ['./select.component.scss']
})
export class SelectFavoritesComponent extends TournamentComponent implements OnInit {
    public favorites!: Favorites;
    public structureNameService!: StructureNameService;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        sructureRepository: StructureRepository,
        globalEventsManager: GlobalEventsManager,
        modalService: NgbModal,
        favRepository: FavoritesRepository,
        private myNavigation: MyNavigation,
        protected authService: AuthService
    ) {
        super(route, router, tournamentRepository, sructureRepository, globalEventsManager, modalService, favRepository);
        this.resetAlert();
    }

    ngOnInit() {
        super.myNgOnInit(() => {
            this.updateFavoriteCategories(this.structure);
            const startLocationMap = new StartLocationMap(this.tournament.getCompetitors());
            this.structureNameService = new StructureNameService(startLocationMap);
            this.favorites = this.favRepository.getObject(this.tournament, this.structure.getCategories());
            if (this.hasCompetitors() === false) {
                this.setAlert(IAlertType.Info, 'er zijn nog geen deelnemers ingevuld, je kunt daarom nog geen deelnemers kiezen');
            }
            this.processing = false;
        });
    }

    isAdmin(): boolean {
        return this.hasRole(this.authService, Role.Admin);
    }

    get FavoritesScreen(): TournamentScreen { return TournamentScreen.Favorites }

    hasCompetitors() {
        return this.tournament.getCompetitors().length > 0;
    }

    save() {
        this.myNavigation.back();
    }

    toggleFavoriteReferee(referee: Referee) {
        if (this.favorites.hasReferee(referee)) {
            this.favorites.removeReferee(referee);
        } else {
            this.favorites.addReferee(referee);
        }
        this.favRepository.editObject(this.favorites);
    }

    hasReferees() {
        return this.competition.getReferees().length > 0;
    }

    navigateBack() {
        this.myNavigation.back();
    }
}

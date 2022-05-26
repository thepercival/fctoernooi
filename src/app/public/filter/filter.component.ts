import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Competitor, Place, Referee, Structure, Category, StructureNameService, StartLocationMap } from 'ngx-sport';

import { MyNavigation } from '../../shared/common/navigation';
import { Favorites } from '../../lib/favorites';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { AuthService } from '../../lib/auth/auth.service';
import { Role } from '../../lib/role';
import { PlaceCompetitorItem } from '../../lib/ngx-sport/placeCompetitorItem';
import { TournamentCompetitor } from '../../lib/competitor';
import { IAlertType } from '../../shared/common/alert';
import { GlobalEventsManager } from '../../shared/common/eventmanager';

@Component({
    selector: 'app-tournament-filter',
    templateUrl: './filter.component.html',
    styleUrls: ['./filter.component.scss']
})
export class FilterComponent extends TournamentComponent implements OnInit {
    public placeCompetitorItems: PlaceCompetitorItem[] = [];
    public favorites!: Favorites;
    public processingItem: Referee | Place | undefined;
    public structureNameService!: StructureNameService;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        sructureRepository: StructureRepository,
        globalEventsManager: GlobalEventsManager,
        private myNavigation: MyNavigation,
        public favRepository: FavoritesRepository,
        protected authService: AuthService
    ) {
        super(route, router, tournamentRepository, sructureRepository, globalEventsManager);
        this.resetAlert();
    }

    ngOnInit() {
        super.myNgOnInit(() => {
            const startLocationMap = new StartLocationMap(this.tournament.getCompetitors());
            this.structureNameService = new StructureNameService(startLocationMap);
            this.placeCompetitorItems = this.getPlaceCompetitorItems(startLocationMap);
            this.favorites = this.favRepository.getObject(this.tournament);
            if (this.hasCompetitors() === false) {
                this.setAlert(IAlertType.Info, 'er zijn nog geen deelnemers ingevuld, je kunt daarom nog geen deelnemers kiezen');
            }
            this.processing = false;
        });
    }

    isAdmin(): boolean {
        return this.hasRole(this.authService, Role.ADMIN);
    }

    // @TODO CDK CATEGORY - REMOVE FUNCTION
    getDefaultCategory(structure: Structure): Category {
        return structure.getCategories()[0];
    }

    getPlaceCompetitorItems(map: StartLocationMap): PlaceCompetitorItem[] {
        return this.getDefaultCategory(this.structure).getRootRound().getPlaces().map((place: Place): PlaceCompetitorItem => {
            const startLocation = place.getStartLocation();
            const competitor = startLocation ? map.getCompetitor(startLocation) : undefined;
            return { place, competitor: <TournamentCompetitor | undefined>competitor };
        });
    }

    hasCompetitors() {
        return this.tournament.getCompetitors().length > 0;
    }

    save() {
        this.myNavigation.back();
    }

    toggleFavoriteCompetitor(competitor: Competitor) {
        if (this.favorites.hasCompetitor(competitor)) {
            this.favorites.removeCompetitor(competitor);
        } else {
            this.favorites.addCompetitor(competitor);
        }
        this.favRepository.editObject(this.favorites);
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

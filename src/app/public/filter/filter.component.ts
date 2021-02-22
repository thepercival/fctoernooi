import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Competitor, NameService, Place, Referee, PlaceLocationMap } from 'ngx-sport';

import { MyNavigation } from '../../shared/common/navigation';
import { Favorites } from '../../lib/favorites';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { AuthService } from '../../lib/auth/auth.service';
import { Role } from '../../lib/role';

@Component({
    selector: 'app-tournament-filter',
    templateUrl: './filter.component.html',
    styleUrls: ['./filter.component.scss']
})
export class FilterComponent extends TournamentComponent implements OnInit {
    public places: Place[] = [];
    public favorites!: Favorites;
    public processingItem: Referee | Place | undefined;
    public placeLocationMap!: PlaceLocationMap;
    public nameService!: NameService;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        sructureRepository: StructureRepository,
        private myNavigation: MyNavigation,
        public favRepository: FavoritesRepository,
        protected authService: AuthService
    ) {
        super(route, router, tournamentRepository, sructureRepository);
        this.resetAlert();
    }

    ngOnInit() {
        super.myNgOnInit(() => {
            this.placeLocationMap = new PlaceLocationMap(this.tournament.getCompetitors());
            this.nameService = new NameService(this.placeLocationMap);
            this.initPlaces();
            this.favorites = this.favRepository.getObject(this.tournament);
            this.processing = false;
        });
    }

    isAdmin(): boolean {
        return this.hasRole(this.authService, Role.ADMIN);
    }

    initPlaces() {
        const round = this.structure.getRootRound();
        this.places = round.getPlaces();
        if (this.hasCompetitors() === false) {
            this.setAlert('info', 'er zijn nog geen deelnemers ingevuld, je kunt daarom nog geen deelnemers kiezen');
        }
    }

    hasCompetitors() {
        return this.tournament.getCompetitors().length > 0;
    }

    getCompetitor(place: Place): Competitor {
        return this.placeLocationMap.getCompetitor(place);
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

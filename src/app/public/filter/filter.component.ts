import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Competitor, NameService, Place, Referee } from 'ngx-sport';

import { AuthService } from '../../lib/auth/auth.service';
import { MyNavigation } from '../../shared/common/navigation';
import { Favorites } from '../../lib/favorites';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { Role } from '../../lib/role';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';

@Component({
    selector: 'app-tournament-filter',
    templateUrl: './filter.component.html',
    styleUrls: ['./filter.component.scss']
})
export class FilterComponent extends TournamentComponent implements OnInit {
    places: Place[];
    placeToSwap: Place;
    toggledItem: Competitor | Referee;
    userIsGameResultAdmin: boolean;
    favorites: Favorites;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        sructureRepository: StructureRepository,
        public nameService: NameService,
        private authService: AuthService,
        private myNavigation: MyNavigation,
        public favRepository: FavoritesRepository
    ) {
        super(route, router, tournamentRepository, sructureRepository);
        this.resetAlert();
    }

    ngOnInit() {
        super.myNgOnInit(() => {
            this.initPlaces();
            this.userIsGameResultAdmin = this.tournament.hasRole(this.authService.getLoggedInUserId(), Role.GAMERESULTADMIN);
            this.favorites = this.favRepository.getItem(this.tournament);
            this.processing = false;
        });
    }

    initPlaces() {
        const round = this.structure.getRootRound();
        this.places = round.getPlaces();
        if (this.hasCompetitors() === false) {
            this.setAlert('info', 'er zijn nog geen deelnemers ingevuld, je kunt daarom nog geen filter instellen');
        }
    }

    scrollTo(divId: string) {
        this.myNavigation.scrollTo(divId);
    }

    hasCompetitors() {
        return this.places.some(place => place.getCompetitor() !== undefined);
    }

    toggleFavoriteCompetitor(competitor: Competitor) {
        this.startProgressing(competitor);

        if (this.favorites.hasCompetitor(competitor)) {
            this.favorites.removeCompetitor(competitor);
        } else {
            this.favorites.addCompetitor(competitor);
        }
        this.favRepository.writeToLocalStorage();
    }

    toggleFavoriteReferee(referee: Referee) {
        this.startProgressing(referee);

        if (this.favorites.hasReferee(referee)) {
            this.favorites.removeReferee(referee);
        } else {
            this.favorites.addReferee(referee);
        }
        this.favRepository.writeToLocalStorage();
    }

    private startProgressing(toggledItem: Competitor | Referee) {
        this.toggledItem = toggledItem;
    }

    hasReferees() {
        return this.competition.getReferees().length > 0;
    }

    navigateBack() {
        this.myNavigation.back();
    }
}

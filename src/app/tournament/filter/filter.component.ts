import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { Competitor, NameService, PoulePlace, Referee, StructureRepository } from 'ngx-sport';

import { AuthService } from '../../auth/auth.service';
import { Favorites } from '../../lib/favorites';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { Role } from '../../lib/role';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../component';

@Component({
    selector: 'app-tournament-filter',
    templateUrl: './filter.component.html',
    styleUrls: ['./filter.component.scss']
})
export class TournamentFilterComponent extends TournamentComponent implements OnInit {
    poulePlaces: PoulePlace[];
    poulePlaceToSwap: PoulePlace;
    toggledItem: Competitor | Referee;
    toggledItemProgress = 0;
    userIsGameResultAdmin: boolean;
    favorites: Favorites;

    returnUrlQueryParamKey: string;
    returnUrlQueryParamValue: string;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        sructureRepository: StructureRepository,
        public nameService: NameService,
        private authService: AuthService,
        private scrollService: ScrollToService,
        public favRepository: FavoritesRepository
    ) {
        super(route, router, tournamentRepository, sructureRepository);
        this.resetAlert();
    }

    ngOnInit() {
        super.myNgOnInit(() => {
            this.initPoulePlaces();
            this.userIsGameResultAdmin = this.tournament.hasRole(this.authService.getLoggedInUserId(), Role.GAMERESULTADMIN);
            this.favorites = this.favRepository.getItem(this.tournament);
            this.processing = false;
        });
        this.route.queryParamMap.subscribe(params => {
            this.returnUrlQueryParamKey = params.get('returnQueryParamKey');
            this.returnUrlQueryParamValue = params.get('returnQueryParamValue');
        });
    }

    initPoulePlaces() {
        const round = this.structure.getRootRound();
        this.poulePlaces = round.getPoulePlaces();
        if (this.hasCompetitors() === false) {
            this.setAlert('info', 'er zijn nog geen deelnemers ingevuld, je kunt daarom nog geen filter instellen');
        }
    }

    scrollTo(divId: string) {
        this.scrollService.scrollTo({
            target: divId,
            duration: 200
        });
    }

    hasCompetitors() {
        return this.poulePlaces.some(poulePlace => poulePlace.getCompetitor() !== undefined);
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
        this.toggledItemProgress = 0;
        this.toggledItem = toggledItem;
        this.toggledItemProgress = 10;
        /*const progress = range(1, 10).pipe(
            filter(number => (number % 2) === 0)
        );
        zip(interval(100), progress)
            .subscribe(fromTo => {
                this.toggledItemProgress = fromTo[1];
            });*/
    }

    hasReferees() {
        return this.tournament.getCompetition().getReferees().length > 0;
    }



    private getForwarUrl() {
        return ['/toernooi/view', this.tournament.getId()];
    }

    private getForwarUrlQueryParams(): {} {
        const queryParams = {};
        if (this.returnUrlQueryParamKey !== undefined) {
            queryParams[this.returnUrlQueryParamKey] = this.returnUrlQueryParamValue;
        }
        return queryParams;

    }

    navigateBack() {
        this.router.navigate(this.getForwarUrl(), { queryParams: this.getForwarUrlQueryParams() });
    }
}

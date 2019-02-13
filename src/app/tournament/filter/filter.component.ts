import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { NameService, PoulePlace, Referee, StructureRepository, Competitor } from 'ngx-sport';
import { interval, range, zip } from 'rxjs';
import { filter } from 'rxjs/operators';

import { AuthService } from '../../auth/auth.service';
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

    returnUrlQueryParamKey: string;
    returnUrlQueryParamValue: string;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        sructureRepository: StructureRepository,
        public nameService: NameService,
        private authService: AuthService,
        private scrollService: ScrollToService
    ) {
        super(route, router, tournamentRepository, sructureRepository);
        this.resetAlert();
    }

    ngOnInit() {
        super.myNgOnInit(() => {
            this.initPoulePlaces();
            this.userIsGameResultAdmin = this.tournament.hasRole(this.authService.getLoggedInUserId(), Role.GAMERESULTADMIN);
            this.removeOldFavIds();
            this.processing = false;
        });
        this.route.queryParamMap.subscribe(params => {
            this.returnUrlQueryParamKey = params.get('returnQueryParamKey');
            this.returnUrlQueryParamValue = params.get('returnQueryParamValue');
        });
    }

    removeOldFavIds() {
        const referees = this.tournament.getCompetition().getReferees();
        const favRefereeIds = this.getFavRefereeIdsFromLocalStorage();
        if (favRefereeIds[this.tournament.getId()] === undefined) {
            return;
        }
        favRefereeIds[this.tournament.getId()] = favRefereeIds[this.tournament.getId()].filter(refereeId => {
            return (referees.find(referee => referee.getId() === refereeId) !== undefined);
        });
        localStorage.setItem('favoritereferees', JSON.stringify(favRefereeIds));
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

    inFavoriteCompetitorIds(competitor: Competitor): boolean {
        const favCompetitors = this.getFavCompetitorsFromLocalStorage();
        const favCompetitorIds: number[] = favCompetitors[this.tournament.getId()];
        if (favCompetitorIds === undefined) {
            return false;
        }
        return favCompetitorIds.find(favCompetitorId => favCompetitorId === competitor.getId()) !== undefined;
    }

    toggleFavoriteCompetitors(competitor: Competitor) {
        this.startProgressing(competitor);

        const favCompetitors = this.getFavCompetitorsFromLocalStorage();
        if (favCompetitors[this.tournament.getId()] === undefined) {
            favCompetitors[this.tournament.getId()] = [];
        }
        const favCompetitorIds: number[] = favCompetitors[this.tournament.getId()];
        const index = favCompetitorIds.indexOf(competitor.getId());
        if (index < 0) {
            favCompetitorIds.push(competitor.getId());
        } else {
            favCompetitorIds.splice(index, 1);
        }
        localStorage.setItem('favoritecompetitors', JSON.stringify(favCompetitors));
    }

    private startProgressing(toggledItem: Competitor | Referee) {
        this.toggledItemProgress = 0;
        this.toggledItem = toggledItem;
        const progress = range(1, 10).pipe(
            filter(number => (number % 2) === 0)
        );
        zip(interval(100), progress)
            .subscribe(fromTo => {
                this.toggledItemProgress = fromTo[1];
            });
    }

    protected getFavCompetitorsFromLocalStorage(): any {
        const favCompetitors = localStorage.getItem('favoritecompetitors');
        if (favCompetitors === null) {
            return {};
        }
        return JSON.parse(favCompetitors);
    }

    hasFavoriteCompetitors(): boolean {
        return this.getNrOfFavoriteCompetitors() > 0;
    }

    getNrOfFavoriteCompetitors(): number {
        const favCompetitors = this.getFavCompetitorsFromLocalStorage();
        if (favCompetitors[this.tournament.getId()] === undefined) {
            return 0;
        }
        return favCompetitors[this.tournament.getId()].length;
    }

    hasReferees() {
        return this.tournament.getCompetition().getReferees().length > 0;
    }

    inFavoriteRefereeIds(referee: Referee): boolean {
        const favReferees = this.getFavRefereeIdsFromLocalStorage();
        const favRefereeIds: number[] = favReferees[this.tournament.getId()];
        if (favRefereeIds === undefined) {
            return false;
        }
        return favRefereeIds.find(favRefereeId => favRefereeId === referee.getId()) !== undefined;
    }

    toggleFavoriteReferees(referee: Referee) {
        this.startProgressing(referee);

        const favReferees = this.getFavRefereeIdsFromLocalStorage();
        if (favReferees[this.tournament.getId()] === undefined) {
            favReferees[this.tournament.getId()] = [];
        }
        const favRefereeIds: number[] = favReferees[this.tournament.getId()];
        const index = favRefereeIds.indexOf(referee.getId());
        if (index < 0) {
            favRefereeIds.push(referee.getId());
        } else {
            favRefereeIds.splice(index, 1);
        }
        localStorage.setItem('favoritereferees', JSON.stringify(favReferees));
    }

    protected getFavRefereeIdsFromLocalStorage(): any {
        const favReferees = localStorage.getItem('favoritereferees');
        if (favReferees === null) {
            return {};
        }
        return JSON.parse(favReferees);
    }

    hasFavoriteReferees(): boolean {
        return this.getNrOfFavoriteReferees() > 0;
    }

    getNrOfFavoriteReferees(): number {
        const favReferees = this.getFavRefereeIdsFromLocalStorage();
        if (favReferees[this.tournament.getId()] === undefined) {
            return 0;
        }
        return favReferees[this.tournament.getId()].length;
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

import { CompetitionSportTabOrder } from './competitionSportTabOrder';
import { RoundNumber } from 'ngx-sport';
import { Tournament } from '../../lib/tournament';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
export class CompetitionSportRouter {
    private adminUrl = '/admin';

    constructor(
        private router: Router
    ) {
    }

    navigate(tournament: Tournament, tabOrder?: CompetitionSportTabOrder) {
        let url = this.adminUrl + '/competitionsport';
        let params: any[] = [tournament.getId()];
        const competition = tournament.getCompetition();
        const competitionSport = competition.getSports()[0];
        params.push(competitionSport.getId());
        params.push(tabOrder ? tabOrder : CompetitionSportTabOrder.Fields);
        this.router.navigate([url].concat(params));
    }
}
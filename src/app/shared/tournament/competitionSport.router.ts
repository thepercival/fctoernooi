import { CompetitionSportTab } from './competitionSportTab';
import { CompetitionSport, RoundNumber } from 'ngx-sport';
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

    navigate(tournament: Tournament, tabOrder?: CompetitionSportTab) {
        let url = this.adminUrl + '/competitionsport';
        let params: any[] = [tournament.getId()];
        const competition = tournament.getCompetition();

        if (competition.getSports().length === 1) {
            const competitionSport = competition.getSports()[0];
            params.push(competitionSport.getId());
            params.push(tabOrder ? tabOrder : CompetitionSportTab.Fields);
        } else {
            url += 's';
        }
        this.router.navigate([url].concat(params));
    }
}
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../../repository';
import { AgainstQualifyConfig, AgainstQualifyConfigMapper, JsonAgainstQualifyConfig, Round, CompetitionSportMapper, JsonCompetitionSport, AgainstQualifyConfigService } from 'ngx-sport';
import { Tournament } from '../../tournament';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AgainstQualifyConfigRepository extends APIRepository {

    constructor(
        private service: AgainstQualifyConfigService,
        private mapper: AgainstQualifyConfigMapper,
        private competitionSportMapper: CompetitionSportMapper,
        private http: HttpClient, router: Router) {
        super(router);
    }

    getUrlpostfix(): string {
        return 'qualifyagainstconfigs';
    }

    getUrl(tournament: Tournament, round: Round, competitionSportId: string|number): string {
        return super.getApiUrl() +
            'tournaments/' + tournament.getId() + '/' +
            'rounds/' + round.getId() + '/' +
            'competitionsports/' + competitionSportId + '/' +
            this.getUrlpostfix();
    }

    saveObject(jsonAgainstQualifyConfig: JsonAgainstQualifyConfig, round: Round, tournament: Tournament): Observable<AgainstQualifyConfig> {
        const competitionSport = tournament.getCompetition().getSportById(jsonAgainstQualifyConfig.competitionSportId);
        if( competitionSport === undefined) {
            throw new Error('competitionSport could not be found');
        }
        const url = this.getUrl(tournament, round, jsonAgainstQualifyConfig.competitionSportId);
        return this.http.post<JsonAgainstQualifyConfig>(url, jsonAgainstQualifyConfig, this.getOptions()).pipe(
            map((jsonResult: JsonAgainstQualifyConfig) => {                
                round.getChildren().forEach((child: Round) => this.service.removeFromRound(competitionSport, round));
                return this.mapper.toObject(jsonResult, round, round.getAgainstQualifyConfig(competitionSport));
            }),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }
}

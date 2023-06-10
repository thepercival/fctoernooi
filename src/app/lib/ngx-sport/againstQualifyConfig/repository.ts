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

    getUrl(tournament: Tournament, round: Round, jsonCompetitionSport: JsonCompetitionSport): string {
        return super.getApiUrl() +
            'tournaments/' + tournament.getId() + '/' +
            'rounds/' + round.getId() + '/' +
            'competitionsports/' + jsonCompetitionSport.id + '/' +
            this.getUrlpostfix();
    }

    saveObject(jsonAgainstQualifyConfig: JsonAgainstQualifyConfig, round: Round, tournament: Tournament): Observable<AgainstQualifyConfig> {
        const url = this.getUrl(tournament, round, jsonAgainstQualifyConfig.competitionSport);
        return this.http.post<JsonAgainstQualifyConfig>(url, jsonAgainstQualifyConfig, this.getOptions()).pipe(
            map((jsonResult: JsonAgainstQualifyConfig) => {
                const competitionSport = this.competitionSportMapper.toObject(jsonResult.competitionSport, tournament.getCompetition());
                round.getChildren().forEach((child: Round) => this.service.removeFromRound(competitionSport, round));
                return this.mapper.toObject(jsonResult, round, round.getAgainstQualifyConfig(competitionSport));
            }),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }
}

import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../../repository';
import { ScoreConfig, ScoreConfigMapper, JsonScoreConfig, Round, CompetitionSportMapper, JsonCompetitionSport, ScoreConfigService } from 'ngx-sport';
import { Tournament } from '../../tournament';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class ScoreConfigRepository extends APIRepository {

    constructor(
        private service: ScoreConfigService,
        private mapper: ScoreConfigMapper,
        private competitionSportMapper: CompetitionSportMapper,
        private http: HttpClient,
        router: Router) {
        super(router);
    }

    getUrlpostfix(): string {
        return 'scoreconfigs';
    }

    getUrl(tournament: Tournament, round: Round, jsonCompetitionSportId: string|number): string {
        return super.getApiUrl() +
            'tournaments/' + tournament.getId() + '/' +
            'rounds/' + round.getId() + '/' +
            'competitionsports/' + jsonCompetitionSportId + '/' +
            this.getUrlpostfix();
    }

    saveObject(jsonScoreConfig: JsonScoreConfig, round: Round, tournament: Tournament): Observable<ScoreConfig> {
        const competitionSport = tournament.getCompetition().getSportById(jsonScoreConfig.competitionSportId);
        if (competitionSport === undefined) {
            throw new Error('competitionSport could not be found');
        }
        const url = this.getUrl(tournament, round, jsonScoreConfig.competitionSportId);
        return this.http.post<JsonScoreConfig>(url, jsonScoreConfig, this.getOptions()).pipe(
            map((jsonResult: JsonScoreConfig) => {
                
                round.getChildren().forEach((child: Round) => this.service.removeFromRound(competitionSport, round));
                return this.mapper.toObject(jsonResult, round, round.getScoreConfig(competitionSport));
            }),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }


}

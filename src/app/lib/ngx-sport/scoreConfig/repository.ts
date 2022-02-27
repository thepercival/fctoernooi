import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../../repository';
import { ScoreConfig, ScoreConfigMapper, JsonScoreConfig, Round, CompetitionSport, CompetitionSportMapper, JsonCompetitionSport, ScoreConfigService } from 'ngx-sport';
import { Tournament } from '../../tournament';

@Injectable({
    providedIn: 'root'
})
export class ScoreConfigRepository extends APIRepository {

    constructor(
        private service: ScoreConfigService,
        private mapper: ScoreConfigMapper,
        private competitionSportMapper: CompetitionSportMapper,
        private http: HttpClient) {
        super();
    }

    getUrlpostfix(): string {
        return 'scoreconfigs';
    }

    getUrl(tournament: Tournament, round: Round, jsonCompetitionSport: JsonCompetitionSport): string {
        return super.getApiUrl() +
            'tournaments/' + tournament.getId() + '/' +
            'rounds/' + round.getId() + '/' +
            'competitionsports/' + jsonCompetitionSport.id + '/' +
            this.getUrlpostfix();
    }

    saveObject(jsonScoreConfig: JsonScoreConfig, round: Round, tournament: Tournament): Observable<ScoreConfig> {
        const url = this.getUrl(tournament, round, jsonScoreConfig.competitionSport);
        return this.http.post<JsonScoreConfig>(url, jsonScoreConfig, this.getOptions()).pipe(
            map((jsonResult: JsonScoreConfig) => {
                const competitionSport = this.competitionSportMapper.toObject(jsonResult.competitionSport, tournament.getCompetition());
                round.getChildren().forEach((child: Round) => this.service.removeFromRound(competitionSport, round));
                return this.mapper.toObject(jsonResult, round, round.getScoreConfig(competitionSport));
            }),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }


}

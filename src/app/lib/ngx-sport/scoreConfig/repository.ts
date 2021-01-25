import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../../repository';
import { ScoreConfig, ScoreConfigMapper, JsonScoreConfig, Round, CompetitionSport, CompetitionSportMapper, JsonCompetitionSport } from 'ngx-sport';
import { Tournament } from '../../tournament';


@Injectable()
export class ScoreConfigRepository extends APIRepository {

    constructor(
        private mapper: ScoreConfigMapper, private competitionSportMapper: CompetitionSportMapper, private http: HttpClient) {
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
        return this.http.post(url, jsonScoreConfig, this.getOptions()).pipe(
            map((jsonResult: JsonScoreConfig) => {
                const competitionSport = this.competitionSportMapper.toObject(jsonResult.competitionSport, tournament.getCompetition());
                this.removeDescandants(round, competitionSport);
                return this.mapper.toObject(jsonResult, round, round.getScoreConfig(competitionSport));
            }),
            catchError((err) => this.handleError(err))
        );
    }

    removeDescandants(round: Round, competitionSport: CompetitionSport) {
        round.getChildren().forEach((child: Round) => {
            const scoreConfig = child.getScoreConfig(competitionSport);
            if (scoreConfig) {
                child.getScoreConfigs().splice(child.getScoreConfigs().indexOf(scoreConfig), 1);
            }
            this.removeDescandants(child, competitionSport);
        });
    }
}

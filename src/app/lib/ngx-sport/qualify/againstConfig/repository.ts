import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../../../repository';
import { QualifyAgainstConfig, QualifyAgainstConfigMapper, JsonQualifyAgainstConfig, Round, CompetitionSport, CompetitionSportMapper, JsonCompetitionSport } from 'ngx-sport';
import { Tournament } from '../../../tournament';

@Injectable({
    providedIn: 'root'
})
export class QualifyAgainstConfigRepository extends APIRepository {

    constructor(
        private mapper: QualifyAgainstConfigMapper, private competitionSportMapper: CompetitionSportMapper, private http: HttpClient) {
        super();
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

    saveObject(jsonQualifyAgainstConfig: JsonQualifyAgainstConfig, round: Round, tournament: Tournament): Observable<QualifyAgainstConfig> {
        const url = this.getUrl(tournament, round, jsonQualifyAgainstConfig.competitionSport);
        return this.http.post(url, jsonQualifyAgainstConfig, this.getOptions()).pipe(
            map((jsonResult: JsonQualifyAgainstConfig) => {
                const competitionSport = this.competitionSportMapper.toObject(jsonResult.competitionSport, tournament.getCompetition());
                this.removeDescandants(round, competitionSport);
                return this.mapper.toObject(jsonResult, round, round.getQualifyAgainstConfig(competitionSport));
            }),
            catchError((err) => this.handleError(err))
        );
    }

    removeDescandants(round: Round, competitionSport: CompetitionSport) {
        round.getChildren().forEach((child: Round) => {
            const qualifyagainstConfig = child.getQualifyAgainstConfig(competitionSport);
            if (qualifyagainstConfig) {
                child.getQualifyAgainstConfigs().splice(child.getQualifyAgainstConfigs().indexOf(qualifyagainstConfig), 1);
            }
            this.removeDescandants(child, competitionSport);
        });
    }
}

import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../../../repository';
import { SportScoreConfig, SportScoreConfigMapper, JsonSportScoreConfig, Structure, Sport, RoundNumber } from 'ngx-sport';
import { Tournament } from '../../../tournament';


@Injectable()
export class SportScoreConfigRepository extends APIRepository {

    constructor(
        private mapper: SportScoreConfigMapper, private http: HttpClient) {
        super();
    }

    getUrlpostfix(): string {
        return 'sportscoreconfigs';
    }

    getUrl(tournament: Tournament): string {
        return super.getApiUrl() + 'tournaments/' + tournament.getId() + '/' + this.getUrlpostfix();
    }

    createObject(
        jsonSportScoreConfig: JsonSportScoreConfig, sport: Sport, roundNumber: RoundNumber, tournament: Tournament
    ): Observable<SportScoreConfig> {
        const options = this.getCustomOptions(roundNumber, sport);
        return this.http.post(this.getUrl(tournament), jsonSportScoreConfig, options).pipe(
            map((jsonResult: JsonSportScoreConfig) => this.mapper.toObject(jsonResult, sport, roundNumber)),
            catchError((err) => this.handleError(err))
        );
    }

    editObject(jsonConfig: JsonSportScoreConfig, config: SportScoreConfig, tournament: Tournament): Observable<SportScoreConfig> {
        const url = this.getUrl(tournament) + '/' + config.getId();
        const options = this.getCustomOptions(config.getRoundNumber());
        return this.http.put(url, jsonConfig, options).pipe(
            map((jsonResult: JsonSportScoreConfig) => {
                return this.mapper.toObject(jsonResult, config.getSport(), config.getRoundNumber(), config);
            }),
            catchError((err) => this.handleError(err))
        );
    }

    protected getCustomOptions(roundNumber: RoundNumber, sport?: Sport): { headers: HttpHeaders; params: HttpParams } {
        let httpParams = new HttpParams();
        httpParams = httpParams.set('roundnumber', roundNumber.getNumber().toString());
        if (sport !== undefined) {
            httpParams = httpParams.set('sportid', sport.getId().toString());
        }
        return {
            headers: super.getHeaders(),
            params: httpParams
        };
    }


}

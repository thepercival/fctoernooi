import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../../../repository';
import { ScoreConfig, ScoreConfigMapper, JsonScoreConfig, Structure, Sport, RoundNumber } from 'ngx-sport';
import { Tournament } from '../../../tournament';


@Injectable()
export class ScoreConfigRepository extends APIRepository {

    constructor(
        private mapper: ScoreConfigMapper, private http: HttpClient) {
        super();
    }

    getUrlpostfix(): string {
        return 'scoreconfigs';
    }

    getUrl(tournament: Tournament): string {
        return super.getApiUrl() + 'tournaments/' + tournament.getId() + '/' + this.getUrlpostfix();
    }

    // TODOSPORT
    // createObject(
    //     jsonScoreConfig: JsonScoreConfig, sport: Sport, roundNumber: RoundNumber, tournament: Tournament
    // ): Observable<ScoreConfig> {
    //     const options = this.getCustomOptions(roundNumber, sport);
    //     return this.http.post(this.getUrl(tournament), jsonScoreConfig, options).pipe(
    //         map((jsonResult: JsonScoreConfig) => this.mapper.toObject(jsonResult, sport, roundNumber)),
    //         catchError((err) => this.handleError(err))
    //     );
    // }

    // editObject(jsonConfig: JsonScoreConfig, config: ScoreConfig, tournament: Tournament): Observable<ScoreConfig> {
    //     const url = this.getUrl(tournament) + '/' + config.getId();
    //     const options = this.getCustomOptions(config.getRoundNumber());
    //     return this.http.put(url, jsonConfig, options).pipe(
    //         map((jsonResult: JsonScoreConfig) => {
    //             return this.mapper.toObject(jsonResult, config.getSport(), config.getRoundNumber(), config);
    //         }),
    //         catchError((err) => this.handleError(err))
    //     );
    // }

    // protected getCustomOptions(round: Round, sport?: Sport): { headers: HttpHeaders; params: HttpParams } {
    //     let httpParams = new HttpParams();
    //     httpParams = httpParams.set('round', roundNumber.getNumber().toString());
    //     if (sport !== undefined) {
    //         httpParams = httpParams.set('sportid', sport.getId().toString());
    //     }
    //     return {
    //         headers: super.getHeaders(),
    //         params: httpParams
    //     };
    // }


}

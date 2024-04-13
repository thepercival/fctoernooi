import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../../repository';
import { CompetitionSportMapper, JsonCompetitionSport, RoundNumber, GameAmountConfigMapper, JsonGameAmountConfig, GameAmountConfig, GameAmountConfigService } from 'ngx-sport';
import { Tournament } from '../../tournament';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class GameAmountConfigRepository extends APIRepository {

    constructor(
        private service: GameAmountConfigService,
        private mapper: GameAmountConfigMapper,
        private competitionSportMapper: CompetitionSportMapper,
        private http: HttpClient,
        router: Router) {
        super(router);
    }

    getUrlpostfix(): string {
        return 'gameamountconfigs';
    }

    getUrl(tournament: Tournament, roundNumber: RoundNumber, jsonCompetitionSportId: string|number): string {
        return super.getApiUrl() +
            'tournaments/' + tournament.getId() + '/' +
            'roundnumbers/' + roundNumber.getNumber() + '/' +
            'competitionsports/' + jsonCompetitionSportId + '/' +
            this.getUrlpostfix();
    }

    saveObject(jsonGameAmountConfig: JsonGameAmountConfig, roundNumber: RoundNumber, tournament: Tournament): Observable<GameAmountConfig> {
        const competitionSport = tournament.getCompetition().getSportById(jsonGameAmountConfig.competitionSportId);
        if (competitionSport === undefined) {
            throw new Error('competitionSport could not be found');
        }
        const url = this.getUrl(tournament, roundNumber, competitionSport.getId());
        return this.http.post<JsonGameAmountConfig>(url, jsonGameAmountConfig, this.getOptions()).pipe(
            map((jsonResult: JsonGameAmountConfig) => {
                const nextRoundNumber = roundNumber.getNext();
                if (nextRoundNumber) {
                    this.service.removeFromRoundNumber(competitionSport, nextRoundNumber);
                }
                return this.mapper.toObject(jsonResult, roundNumber, roundNumber.getGameAmountConfig(competitionSport));
            }),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }
}

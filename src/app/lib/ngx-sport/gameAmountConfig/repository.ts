import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../../repository';
import { CompetitionSportMapper, JsonCompetitionSport, RoundNumber, GameAmountConfigMapper, JsonGameAmountConfig, GameAmountConfig, GameAmountConfigService } from 'ngx-sport';
import { Tournament } from '../../tournament';

@Injectable({
    providedIn: 'root'
})
export class GameAmountConfigRepository extends APIRepository {

    constructor(
        private service: GameAmountConfigService,
        private mapper: GameAmountConfigMapper,
        private competitionSportMapper: CompetitionSportMapper,
        private http: HttpClient) {
        super();
    }

    getUrlpostfix(): string {
        return 'gameamountconfigs';
    }

    getUrl(tournament: Tournament, roundNumber: RoundNumber, jsonCompetitionSport: JsonCompetitionSport): string {
        return super.getApiUrl() +
            'tournaments/' + tournament.getId() + '/' +
            'roundnumbers/' + roundNumber.getNumber() + '/' +
            'competitionsports/' + jsonCompetitionSport.id + '/' +
            this.getUrlpostfix();
    }

    saveObject(jsonGameAmountConfig: JsonGameAmountConfig, roundNumber: RoundNumber, tournament: Tournament): Observable<GameAmountConfig> {
        const url = this.getUrl(tournament, roundNumber, jsonGameAmountConfig.competitionSport);
        return this.http.post(url, jsonGameAmountConfig, this.getOptions()).pipe(
            map((jsonResult: JsonGameAmountConfig) => {
                const competitionSport = this.competitionSportMapper.toObject(jsonResult.competitionSport, tournament.getCompetition());
                if (roundNumber.hasNext()) {
                    this.service.removeFromRoundNumber(competitionSport, roundNumber.getNext());
                }
                return this.mapper.toObject(jsonResult, roundNumber, roundNumber.getGameAmountConfig(competitionSport));
            }),
            catchError((err) => this.handleError(err))
        );
    }
}

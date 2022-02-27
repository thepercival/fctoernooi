import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { PlanningConfigMapper, RoundNumber, JsonPlanningConfig, PlanningConfig } from 'ngx-sport';
import { APIRepository } from '../../../repository';
import { Tournament } from '../../../tournament';

@Injectable({
    providedIn: 'root'
})
export class PlanningConfigRepository extends APIRepository {

    constructor(
        private planningConfigMapper: PlanningConfigMapper,
        private http: HttpClient) {
        super();
    }

    getUrl(tournament: Tournament, roundNumber: RoundNumber): string {
        return super.getApiUrl() + 'tournaments/' + tournament.getId() + '/' + 'roundnumbers/' + roundNumber.getNumber() + '/planningconfigs';
    }

    createObject(json: JsonPlanningConfig, roundNumber: RoundNumber, tournament: Tournament): Observable<PlanningConfig> {
        const url = this.getUrl(tournament, roundNumber);
        return this.http.post<JsonPlanningConfig>(url, json, this.getOptions()).pipe(
            map((jsonRes: JsonPlanningConfig) => this.planningConfigMapper.toObject(jsonRes, roundNumber)),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    saveObject(json: JsonPlanningConfig, roundNumber: RoundNumber, tournament: Tournament): Observable<PlanningConfig> {
        const url = this.getUrl(tournament, roundNumber);
        return this.http.post<JsonPlanningConfig>(url, json, this.getOptions()).pipe(
            map((jsonResult: JsonPlanningConfig) => {
                this.removeNext(roundNumber);
                return this.planningConfigMapper.toObject(jsonResult, roundNumber);
            }),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    private removeNext(roundNumber: RoundNumber) {
        const nextRoundNumber = roundNumber.getNext();
        if (nextRoundNumber === undefined) {
            return;
        }
        nextRoundNumber.setPlanningConfig(undefined);
        this.removeNext(nextRoundNumber);
    }
}

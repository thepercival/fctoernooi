import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { PlanningConfigMapper, RoundNumber, JsonPlanningConfig, PlanningConfig } from 'ngx-sport';
import { APIRepository } from '../../../repository';
import { Tournament } from '../../../tournament';

@Injectable()
export class PlanningConfigRepository extends APIRepository {

    constructor(
        private planningConfigMapper: PlanningConfigMapper,
        private http: HttpClient) {
        super();
    }

    getUrlpostfix(): string {
        return 'planningconfigs';
    }

    getUrl(tournament: Tournament, roundNumber: RoundNumber): string {
        return super.getApiUrl() + '/tournaments/' + tournament.getId() + '/' + this.getUrlpostfix() + '/' + roundNumber.getNumber();
    }

    createObject(json: JsonPlanningConfig, roundNumber: RoundNumber, tournament: Tournament): Observable<PlanningConfig> {
        const url = this.getUrl(tournament, roundNumber);
        return this.http.post(url, json, this.getOptions()).pipe(
            map((jsonRes: JsonPlanningConfig) => this.planningConfigMapper.toObject(jsonRes, roundNumber)),
            catchError((err) => this.handleError(err))
        );
    }

    editObject(json: JsonPlanningConfig, config: PlanningConfig, tournament: Tournament): Observable<PlanningConfig> {
        const roundNumber = config.getRoundNumber();
        const url = this.getUrl(tournament, roundNumber) + '/' + config.getId();
        return this.http.put(url, json, this.getOptions()).pipe(
            map((jsonRes: JsonPlanningConfig) => this.planningConfigMapper.toObject(jsonRes, roundNumber, config)),
            catchError((err) => this.handleError(err))
        );
    }

    // editObject(roundNumber: RoundNumber, config: JsonPlanningConfig): Observable<PlanningConfig[][]> {
    //     return forkJoin(this.getUpdates(roundNumber, config));
    // }
    // getUpdates(roundNumber: RoundNumber, config: JsonPlanningConfig): Observable<PlanningConfig[]>[] {
    //     let reposUpdates: Observable<PlanningConfig[]>[] = [];
    //     const options = this.getOptions(roundNumber);
    //     reposUpdates.push(
    //         this.http.put(this.url + '/' + roundNumber.getPlanningConfig().getId(), config, options).pipe(
    //             map((json: JsonPlanningConfig) => this.mapper.toObject(json, roundNumber)),
    //             catchError((err) => this.handleError(err))
    //         )
    //     );
    //     if ( roundNumber.hasNext() ) {
    //         reposUpdates = reposUpdates.concat( this.getUpdates(roundNumber.getNext(), config) );
    //     }
    //     return reposUpdates;
    // }


}

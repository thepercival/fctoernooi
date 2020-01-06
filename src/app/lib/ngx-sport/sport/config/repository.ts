import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../../../repository';
import { SportConfig, SportConfigMapper, JsonSportConfig, Structure } from 'ngx-sport';
import { Tournament } from '../../../tournament';


@Injectable()
export class SportConfigRepository extends APIRepository {

    constructor(
        private mapper: SportConfigMapper, private http: HttpClient) {
        super();
    }

    getUrlpostfix(): string {
        return 'sportconfigs';
    }

    getUrl(tournament: Tournament): string {
        return super.getApiUrl() + '/tournaments/' + tournament.getId() + '/' + this.getUrlpostfix();
    }

    createObject(sportConfig: SportConfig, tournament: Tournament): Observable<SportConfig> {
        return this.http.post(this.getUrl(tournament), this.mapper.toJson(sportConfig), this.getOptions()).pipe(
            map((res: JsonSportConfig) => this.mapper.toObject(res, tournament.getCompetition(), sportConfig)),
            catchError((err) => this.handleError(err))
        );
    }

    editObject(sportConfig: SportConfig, tournament: Tournament): Observable<SportConfig> {
        const url = this.getUrl(tournament) + '/' + sportConfig.getId();
        return this.http.put(url, this.mapper.toJson(sportConfig), this.getOptions()).pipe(
            map((res: JsonSportConfig) => this.mapper.toObject(res, tournament.getCompetition(), sportConfig)),
            catchError((err) => this.handleError(err))
        );
    }

    removeObject(sportConfig: SportConfig, tournament: Tournament, structure: Structure): Observable<void> {
        const url = this.getUrl(tournament) + '/' + sportConfig.getId();
        return this.http.delete(url, this.getOptions()).pipe(
            catchError((err) => this.handleError(err))
        );
    }
}

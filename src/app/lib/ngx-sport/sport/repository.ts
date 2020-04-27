import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../../repository';
import { JsonSport, SportMapper, Sport } from 'ngx-sport';

@Injectable()
export class SportRepository extends APIRepository {

    constructor(
        private mapper: SportMapper,
        private http: HttpClient) {
        super();
    }

    getUrlpostfix(): string {
        return 'sports';
    }

    getUrl(): string {
        return super.getApiUrl() + this.getUrlpostfix();
    }

    getObjectByCustomId(customId: number): Observable<Sport> {
        const url = this.getUrl() + '/' + customId;
        return this.http.get(url, this.getOptions()).pipe(
            map((json: JsonSport) => this.mapper.toObject(json)),
            catchError((err) => this.handleError(err))
        );
    }

    createObject(json: JsonSport): Observable<Sport> {
        return this.http.post(this.getUrl(), json, this.getOptions()).pipe(
            map((jsonRes: JsonSport) => this.mapper.toObject(jsonRes)),
            catchError((err) => this.handleError(err))
        );
    }

    protected getOptions(): { headers: HttpHeaders; params: HttpParams } {
        const httpParams = new HttpParams();
        return {
            headers: super.getHeaders(),
            params: httpParams
        };
    }
}

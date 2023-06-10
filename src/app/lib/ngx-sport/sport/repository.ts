import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../../repository';
import { JsonSport, SportMapper, Sport } from 'ngx-sport';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class SportRepository extends APIRepository {

    constructor(
        private mapper: SportMapper,
        private http: HttpClient,
        router: Router) {
        super(router);
    }

    getUrlpostfix(): string {
        return 'sports';
    }

    getUrl(): string {
        return super.getApiUrl() + this.getUrlpostfix();
    }

    getObjects(): Observable<Sport[]> {
        return this.http.get<JsonSport[]>(this.getUrl(), this.getOptions()).pipe(
            map((jsonSports: JsonSport[]) => jsonSports.map((jsonSport: JsonSport) => {
                return this.mapper.toObject(jsonSport);
            })),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    getObjectByCustomId(customId: number): Observable<Sport> {
        const url = this.getUrl() + '/' + customId;
        return this.http.get<JsonSport>(url, this.getOptions()).pipe(
            map((json: JsonSport) => this.mapper.toObject(json)),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    createObject(json: JsonSport): Observable<Sport> {
        return this.http.post<JsonSport>(this.getUrl(), json, this.getOptions()).pipe(
            map((jsonRes: JsonSport) => this.mapper.toObject(jsonRes)),
            catchError((err: HttpErrorResponse) => this.handleError(err))
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

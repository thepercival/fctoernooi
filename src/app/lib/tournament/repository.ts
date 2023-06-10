import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Tournament } from '../tournament';
import { TournamentMapper } from './mapper';
import { APIRepository } from '../repository';
import { JsonTournament } from './json';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class TournamentRepository extends APIRepository {

    private url: string;

    constructor(
        private http: HttpClient,
        private mapper: TournamentMapper,
        router: Router) {
        super(router);
        this.url = super.getApiUrl() + this.getUrlpostfix();
    }

    getUrlpostfix(): string {
        return 'tournaments';
    }

    getUrl(tournamentId?: string | number): string {
        return this.url + (tournamentId ? ('/' + tournamentId) : '');
    }

    getObject(id: number | string): Observable<Tournament> {
        const url = super.getApiUrl() + (this.getToken() === undefined ? 'public/' : '') + this.getUrlpostfix() + '/' + id;
        return this.http.get<JsonTournament>(url, { headers: super.getHeaders() }).pipe(
            map((jsonTournament: JsonTournament) => this.mapper.toObject(jsonTournament)),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    getUserRefereeId(tournament: Tournament): Observable<string | number> {
        if (this.getToken() === undefined) {
            return of(0);
        }
        const url = this.getUrl(tournament.getId()) + '/userrefereeid';
        return this.http.get<JsonTournament>(url, { headers: super.getHeaders() }).pipe(
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    createObject(json: JsonTournament): Observable<Tournament> {
        return this.http.post<JsonTournament>(this.url, json, { headers: super.getHeaders() }).pipe(
            map((jsonTournament: JsonTournament) => this.mapper.toObject(jsonTournament)),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    editObject(json: JsonTournament): Observable<Tournament> {
        const url = this.getUrl(json.id);
        return this.http.put<JsonTournament>(url, json, { headers: super.getHeaders() }).pipe(
            map((res: JsonTournament) => {
                return this.mapper.toObject(res);
            }),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    removeObject(tournament: Tournament): Observable<boolean> {
        const url = this.getUrl(tournament.getId());
        return this.http.delete(url, { headers: super.getHeaders() }).pipe(
            map((res) => true),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    copyObject(tournament: Tournament, newStartDateTime: Date): Observable<number | string> {
        const url = this.getUrl(tournament.getId()) + '/copy';
        return this.http.post<number | string>(url, { startdatetime: newStartDateTime }, this.getOptions()).pipe(
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }
}
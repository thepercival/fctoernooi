import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { APIConfig, APIRepository } from 'ngx-sport';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Role } from '../role';
import { JsonRole, RoleMapper } from '../role/mapper';
import { Tournament } from '../tournament';
import { JsonTournament, TournamentMapper } from './mapper';


/**
 * Created by coen on 1-10-17.
 */
@Injectable()
export class TournamentRepository extends APIRepository {

    private url: string;

    constructor(
        private http: HttpClient,
        private mapper: TournamentMapper,
        private roleMapper: RoleMapper,
        router: Router) {
        super(router);
        this.url = super.getApiUrl() + this.getUrlpostfix();
    }

    getUrlpostfix(): string {
        return 'tournaments';
    }

    getUrl(): string {
        return this.url;
    }

    getObject(id: number): Observable<Tournament> {
        const postUrl = APIConfig.getToken() === undefined ? 'public' : '';
        return this.http.get<JsonTournament>(this.url + postUrl + '/' + id, { headers: super.getHeaders() }).pipe(
            map((jsonTournament: JsonTournament) => this.mapper.toObject(jsonTournament)),
            catchError((err) => this.handleError(err))
        );
    }

    getUserRefereeId(tournament: Tournament): Observable<number> {
        if (APIConfig.getToken() === undefined) {
            return of(0);
        }
        return this.http.get<JsonTournament>(this.url + '/userrefereeid/' + tournament.getId(), { headers: super.getHeaders() }).pipe(
            // map((userRefereeId: number) => userRefereeId),
            catchError((err) => this.handleError(err))
        );
    }

    createObject(tournament: Tournament): Observable<Tournament> {
        return this.http.post(this.url, this.mapper.toJson(tournament), { headers: super.getHeaders() }).pipe(
            map((res: JsonTournament) => this.mapper.toObject(res)),
            catchError((err) => this.handleError(err))
        );
    }

    editObject(tournament: Tournament): Observable<Tournament> {
        const url = this.url + '/' + tournament.getId();
        return this.http.put(url, this.mapper.toJson(tournament), { headers: super.getHeaders() }).pipe(
            map((res: JsonTournament) => {
                return this.mapper.toObject(res);
            }),
            catchError((err) => this.handleError(err))
        );
    }

    removeObject(tournament: Tournament): Observable<boolean> {
        const url = this.url + '/' + tournament.getId();
        return this.http.delete(url, { headers: super.getHeaders() }).pipe(
            map((res) => true),
            catchError((err) => this.handleError(err))
        );
    }

    copyObject(tournament: Tournament, newStartDateTime: Date): Observable<number> {
        const url = this.url + '/copy/' + tournament.getId();
        return this.http.post(url, null, this.getOptions(newStartDateTime)).pipe(
            map((id: number) => id),
            catchError((err) => this.handleError(err))
        );
    }

    protected getOptions(newStartDateTime: Date): { headers: HttpHeaders; params: HttpParams } {
        let httpParams = new HttpParams();
        httpParams = httpParams.set('startdatetime', newStartDateTime.toISOString());
        return {
            headers: super.getHeaders(),
            params: httpParams
        };
    }

    syncRefereeRoles(tournament: Tournament): Observable<Role[]> {
        const url = this.url + '/syncrefereeroles/' + tournament.getId();
        return this.http.post(url, null, { headers: super.getHeaders() }).pipe(
            map((jsonRoles: JsonRole[]) => jsonRoles.map(jsonRole => this.roleMapper.toObject(jsonRole, tournament))),
            catchError((err) => this.handleError(err))
        );
    }

    getPrintUrl(tournament: Tournament, printConfig: TournamentPrintConfig): string {
        return this.getUrl() + '/pdf/' + tournament.getId() +
            '?gamenotes=' + printConfig.gamenotes +
            '&structure=' + printConfig.structure +
            '&rules=' + printConfig.rules +
            '&gamesperpoule=' + printConfig.gamesperpoule +
            '&gamesperfield=' + printConfig.gamesperfield +
            '&planning=' + printConfig.planning +
            '&poulepivottables=' + printConfig.poulepivottables +
            '&qrcode=' + printConfig.qrcode;
    }
}

export interface TournamentPrintConfig {
    gamenotes: boolean;
    structure: boolean;
    rules: boolean;
    gamesperpoule: boolean;
    gamesperfield: boolean;
    planning: boolean;
    poulepivottables: boolean;
    qrcode: boolean;
}

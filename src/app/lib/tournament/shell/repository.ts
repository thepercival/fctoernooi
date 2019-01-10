import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SportConfig, SportRepository } from 'ngx-sport';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Created by coen on 1-10-17.
 */
@Injectable()
export class TournamentShellRepository extends SportRepository {

    private url: string;

    constructor(
        private http: HttpClient,
        router: Router) {
        super(router);
        this.url = super.getApiUrl() + this.getUrlpostfix();
    }

    getUrlpostfix(): string {
        return 'tournamentshells';
    }

    getUrl(): string {
        return this.url;
    }

    getObjects(filter?: TournamentShellFilter): Observable<TournamentShell[]> {
        const options = {
            headers: super.getHeaders(),
            params: this.getHttpParams(false, filter)
        };
        return this.http.get<TournamentShell[]>(this.url, options).pipe(
            map((jsonShells: TournamentShell[]) => this.convertObjects(jsonShells)),
            catchError((err) => this.handleError(err))
        );
    }

    getObjectsWithRoles(filter?: TournamentShellFilter): Observable<TournamentShell[]> {
        const options = {
            headers: super.getHeaders(),
            params: this.getHttpParams(true, filter)
        };
        return this.http.get<TournamentShell[]>(this.url + 'withroles', options).pipe(
            map((jsonShells: TournamentShell[]) => this.convertObjects(jsonShells)),
            catchError((err) => this.handleError(err))
        );
    }

    private convertObjects(jsonArray: TournamentShell[]): TournamentShell[] {
        for (const jsonShell of jsonArray) {
            jsonShell.startDateTime = new Date(jsonShell.startDateTime);
        }
        return jsonArray;
    }

    getHttpParams(withRoles: boolean, filter?: TournamentShellFilter): HttpParams {
        let httpParams = new HttpParams();
        if (withRoles === true && SportConfig.getToken() !== undefined) {
            httpParams = httpParams.set('withRoles', filter.withRoles ? 'true' : 'false');
        }
        if (filter === undefined) {
            return httpParams;
        }
        if (filter.minDate !== undefined) {
            httpParams = httpParams.set('minDate', filter.minDate.toISOString());
        }
        if (filter.maxDate !== undefined) {
            httpParams = httpParams.set('maxDate', filter.maxDate.toISOString());
        }
        if (filter.name !== undefined) {
            httpParams = httpParams.set('name', filter.name);
        }
        return httpParams;
    }

}

export interface TournamentShell {
    tournamentId: number;
    sport: string;
    name: string;
    startDateTime: Date;
    hasEditPermissions: boolean;
}

export interface TournamentShellFilter {
    minDate?: Date;
    maxDate?: Date;
    name?: string;
    withRoles?: boolean;
}
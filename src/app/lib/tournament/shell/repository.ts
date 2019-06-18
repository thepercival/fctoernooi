import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { APIConfig, SportRepository } from 'ngx-sport';
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

    private getHttpParams(withRoles: boolean, filter?: TournamentShellFilter): HttpParams {
        let httpParams = new HttpParams();
        if (withRoles && APIConfig.getToken() !== undefined) {
            httpParams = httpParams.set('withRoles', 'true');
        }
        if (filter === undefined) {
            return httpParams;
        }
        if (filter.startDate !== undefined) {
            httpParams = httpParams.set('startDate', filter.startDate.toISOString());
        }
        if (filter.endDate !== undefined) {
            httpParams = httpParams.set('endDate', filter.endDate.toISOString());
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
    public: boolean;
}

export interface TournamentShellFilter {
    startDate?: Date;
    endDate?: Date;
    name?: string;
    withRoles?: boolean;
}
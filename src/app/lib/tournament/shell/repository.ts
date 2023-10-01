import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { APIRepository } from '../../repository';
import { TournamentShell } from '../shell';
import { Router } from '@angular/router';

@Injectable()
export class TournamentShellRepository extends APIRepository {

    constructor(
        private http: HttpClient, router: Router) {
        super(router);
    }

    getUrlpostfix(withRole: boolean): string {
        return 'shells' + (withRole ? 'withrole' : '');
    }

    getUrl(withRole: boolean): string {
        return super.getApiUrl() + (this.getToken() === undefined ? 'public/' : '') + this.getUrlpostfix(withRole);
    }

    getObjects(filter?: TournamentShellFilter): Observable<TournamentShell[]> {
        const options = {
            headers: super.getHeaders(),
            params: this.getHttpParams(filter)
        };
        const withRole: boolean = filter && filter.roles ? filter.roles > 0 : false;
        return this.http.get<TournamentShell[]>(this.getUrl(withRole), options).pipe(
            map((jsonShells: TournamentShell[]) => this.convertObjects(jsonShells)),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    private convertObjects(jsonArray: TournamentShell[]): TournamentShell[] {
        for (const jsonShell of jsonArray) {
            jsonShell.startDateTime = new Date(jsonShell.startDateTime);
        }
        return jsonArray;
    }

    private getHttpParams(filter?: TournamentShellFilter): HttpParams {
        let httpParams = new HttpParams();
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
        if (filter.roles !== undefined) {
            httpParams = httpParams.set('roles', '' + filter.roles);
        }
        if (filter.example !== undefined) {
            httpParams = httpParams.set('example', filter.example === true ? '1' : '0');
        }
        return httpParams;
    }
}

export interface TournamentShellFilter {
    startDate?: Date;
    endDate?: Date;
    name?: string;
    roles?: number;
    example?: boolean;
}

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { APIRepository } from '../../repository';

/**
 * Created by coen on 1-10-17.
 */
@Injectable()
export class TournamentShellRepository extends APIRepository {

    private url: string;

    constructor(
        private http: HttpClient) {
        super();
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
        const withRole: boolean = filter ? filter.roles > 0 : false;
        return this.http.get<TournamentShell[]>(this.getUrl(withRole), options).pipe(
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
        return httpParams;
    }
}

export interface TournamentShell {
    tournamentId: number;
    sportCustomId: number;
    name: string;
    startDateTime: Date;
    roles: number;
    public: boolean;
}

export interface TournamentShellFilter {
    startDate?: Date;
    endDate?: Date;
    name?: string;
    roles?: number;
}

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JsonPeriod, Period } from 'ngx-sport';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Recess } from '../recess';

import { APIRepository } from '../repository';
import { Tournament } from '../tournament';

@Injectable({
    providedIn: 'root'
})
export class RecessRepository extends APIRepository {

    constructor(
        private http: HttpClient) {
        super();
    }

    getUrlpostfix(): string {
        return 'recesses';
    }


    getUrl(tournament: Tournament): string {
        return super.getApiUrl() + 'tournaments/' + tournament.getId() + '/' + this.getUrlpostfix();
    }

    createObject(jsonPeriod: JsonPeriod, tournament: Tournament): Observable<Recess> {
        return this.http.post<JsonPeriod>(this.getUrl(tournament), jsonPeriod, this.getOptions()).pipe(
            map((resPeriod: JsonPeriod): Recess => {
                return new Recess(tournament, new Date(resPeriod.start), new Date(resPeriod.end));
            }),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    removeObject(recess: Recess, tournament: Tournament): Observable<void> {
        const url = this.getUrl(tournament) + '/' + recess.getId();
        return this.http.delete(url, this.getOptions()).pipe(
            map(() => {
                const index = tournament.getRecesses().indexOf(recess);
                if (index > -1) {
                    tournament.getRecesses().splice(index, 1);
                }
            }),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }
}



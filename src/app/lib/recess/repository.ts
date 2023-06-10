import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JsonPeriod, Period } from 'ngx-sport';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Recess } from '../recess';

import { APIRepository } from '../repository';
import { Tournament } from '../tournament';
import { JsonRecess } from './json';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class RecessRepository extends APIRepository {

    constructor(
        private http: HttpClient, router: Router) {
        super(router);
    }

    getUrlpostfix(): string {
        return 'recesses';
    }


    getUrl(tournament: Tournament): string {
        return super.getApiUrl() + 'tournaments/' + tournament.getId() + '/' + this.getUrlpostfix();
    }

    createObject(jsonRecess: JsonRecess, tournament: Tournament): Observable<Recess> {
        return this.http.post<JsonRecess>(this.getUrl(tournament), jsonRecess, this.getOptions()).pipe(
            map((jsonRecessResult: JsonRecess): Recess => {
                const recess = new Recess(tournament, jsonRecessResult.name, new Date(jsonRecessResult.start), new Date(jsonRecessResult.end));
                recess.setId(jsonRecessResult.id);
                return recess;
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



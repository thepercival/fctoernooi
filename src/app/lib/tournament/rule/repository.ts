import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Router } from '@angular/router';
import { APIRepository } from '../../repository';
import { Tournament } from '../../tournament';
import { JsonTournamentRule } from './json';

@Injectable({
    providedIn: 'root'
})
export class TournamentRuleRepository extends APIRepository {

    static readonly MIN_LENGTH_DESCRIPTION = 5;
    static readonly MAX_LENGTH_DESCRIPTION = 80;

    constructor(
        private http: HttpClient,
        router: Router) {
        super(router);
    }

    getUrl(tournament: Tournament, ruleId: string | number | undefined = undefined): string {
        const prefix = this.getToken() ? '' : 'public/';
        const suffix = ruleId !== undefined ? ('/' + ruleId) : '';
        return super.getApiUrl() + prefix + 'tournaments/' + tournament.getId() + '/rules' + suffix;
    }

    getObjects(tournament: Tournament): Observable<JsonTournamentRule[]> {
        return this.http.get<JsonTournamentRule[]>(this.getUrl(tournament), this.getOptions()).pipe(
            catchError((err: HttpErrorResponse) => this.handleError(err))
        )
    }

    createObject(text: string, tournament: Tournament): Observable<JsonTournamentRule> {
        const ruleToCreate = {
            id: 0,
            text,
            order: 0
        };
        return this.http.post<JsonTournamentRule>(this.getUrl(tournament), ruleToCreate, this.getOptions()).pipe(
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    editObject(jsonRule: JsonTournamentRule, tournament: Tournament): Observable<JsonTournamentRule> {
        const url = this.getUrl(tournament, jsonRule.id);
        return this.http.put<JsonTournamentRule>(url, jsonRule, this.getOptions()).pipe(
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    upgradeObject(ruleToUpgrade: JsonTournamentRule, ruleToDowngrade: JsonTournamentRule | undefined, tournament: Tournament): Observable<void> {
        const url = this.getUrl(tournament) + '/' + ruleToUpgrade.id + '/priorityup';
        return this.http.post(url, undefined, this.getOptions()).pipe(
            map(() => {
                ruleToUpgrade.priority--;
                if (ruleToDowngrade) {
                    ruleToDowngrade.priority++;
                }
            }),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    removeObject(jsonRule: JsonTournamentRule, tournament: Tournament): Observable<void> {
        const url = this.getUrl(tournament, jsonRule.id);
        return this.http.delete(url, this.getOptions()).pipe(
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }
}

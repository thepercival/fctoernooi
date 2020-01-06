import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { PlanningMapper, JsonStructure, RoundNumber, PlanningPeriod, Game } from 'ngx-sport';
import { APIRepository } from '../../repository';
import { Tournament } from '../../tournament';

@Injectable()
export class PlanningRepository extends APIRepository {

    constructor(
        private planningMapper: PlanningMapper,
        private http: HttpClient) {
        super();
    }

    getUrlpostfix(): string {
        return 'planning';
    }

    getUrl(tournament: Tournament, roundNumber: RoundNumber): string {
        return super.getApiUrl() + '/tournaments/' + tournament.getId() + '/' + this.getUrlpostfix() + '/' + roundNumber.getNumber();
    }

    getObject(roundNumber: RoundNumber, tournament: Tournament): Observable<RoundNumber> {
        return this.http.get(this.getUrl(tournament, roundNumber), this.getCustomOptions()).pipe(
            map((jsonStructure: JsonStructure) => this.planningMapper.toObject(jsonStructure, roundNumber)),
            catchError((err) => this.handleError(err))
        );
    }

    createObject(roundNumber: RoundNumber, tournament: Tournament): Observable<RoundNumber> {
        this.removeGames(roundNumber);
        const url = this.getUrl(tournament, roundNumber) + '/create';
        return this.http.post(url, undefined, this.getCustomOptions(tournament.getBreak())).pipe(
            map((jsonStructure: JsonStructure) => this.planningMapper.toObject(jsonStructure, roundNumber)),
            catchError((err) => this.handleError(err))
        );
    }

    protected removeGames(roundNumber: RoundNumber) {
        roundNumber.getPoules().forEach(poule => {
            poule.getGames().splice(0, poule.getGames().length);
        });
        if (roundNumber.hasNext()) {
            this.removeGames(roundNumber.getNext());
        }
    }

    editObject(roundNumber: RoundNumber, tournament: Tournament): Observable<boolean> {
        const url = this.getUrl(tournament, roundNumber) + '/reschedule';
        return this.http.post(url, undefined, this.getCustomOptions(tournament.getBreak())).pipe(
            map((dates: Date[]) => this.reschedule(roundNumber, dates)),
            catchError((err) => this.handleError(err))
        );
    }

    private reschedule(roundNumber: RoundNumber, dates: Date[]): boolean {
        let previousBatchNr, gameDate;
        roundNumber.getGames(Game.ORDER_BY_BATCH).forEach(game => {
            if (previousBatchNr === undefined || previousBatchNr !== game.getBatchNr()) {
                previousBatchNr = game.getBatchNr();
                if (dates.length === 0) {
                    throw new Error('niet genoeg datums om planning aan te passen');
                }
                gameDate = dates.pop();
            }
            game.setStartDateTime(gameDate);
        });
        if (roundNumber.hasNext()) {
            // batchDates
            this.reschedule(roundNumber.getNext(), dates);
        }
        return true;
    }

    protected getCustomOptions(blockedPeriod?: PlanningPeriod, withNext?: boolean): { headers: HttpHeaders; params: HttpParams } {
        let httpParams = new HttpParams();
        if (blockedPeriod !== undefined) {
            httpParams = httpParams.set('blockedperiodstart', blockedPeriod.start.toISOString());
            httpParams = httpParams.set('blockedperiodend', blockedPeriod.end.toISOString());
        }
        if (withNext !== undefined) {
            httpParams = httpParams.set('withnext', withNext.toString());
        }

        return {
            headers: super.getHeaders(),
            params: httpParams
        };
    }
}

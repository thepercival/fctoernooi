import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../../repository';
import { Referee, RefereeMapper, JsonReferee, Competition } from 'ngx-sport';
import { Tournament } from '../../tournament';

@Injectable({
    providedIn: 'root'
})
export class RefereeRepository extends APIRepository {

    constructor(
        private mapper: RefereeMapper, private http: HttpClient) {
        super();
    }

    getUrlpostfix(): string {
        return 'referees';
    }

    getUrl(tournament: Tournament): string {
        return super.getApiUrl() + 'tournaments/' + tournament.getId() + '/' + this.getUrlpostfix();
    }

    createObject(json: JsonReferee, tournament: Tournament, invite: boolean): Observable<Referee> {
        const inviteSuffix = '/invite/' + (invite ? 'true' : 'false');
        return this.http.post<JsonReferee>(this.getUrl(tournament) + inviteSuffix, json, this.getOptions()).pipe(
            map((jsonRes: JsonReferee) => this.mapper.toObject(jsonRes, tournament.getCompetition())),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    editObject(jsonReferee: JsonReferee, referee: Referee, tournament: Tournament): Observable<Referee> {
        const url = this.getUrl(tournament) + '/' + referee.getId();
        return this.http.put<JsonReferee>(url, jsonReferee, this.getOptions()).pipe(
            map((jsonReferee: JsonReferee) => this.mapper.updateObject(jsonReferee, referee)),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    upgradeObject(referee: Referee, tournament: Tournament): Observable<void> {
        const url = this.getUrl(tournament) + '/' + referee.getId() + '/priorityup';
        return this.http.post(url, undefined, this.getOptions()).pipe(
            map(() => {
                const competition = referee.getCompetition();
                const downgrade = competition.getReferee(referee.getPriority() - 1);
                if (!downgrade) {
                    return;
                }
                referee.setPriority(downgrade.getPriority());
                downgrade.setPriority(downgrade.getPriority() + 1);
                competition.getReferees().sort((refA, refB) => refA.getPriority() - refB.getPriority());
            }),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    removeObject(referee: Referee, tournament: Tournament): Observable<void> {
        const url = this.getUrl(tournament) + '/' + referee.getId();
        return this.http.delete(url, this.getOptions()).pipe(
            map(() => {
                this.removeReferee(referee);

            }),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    protected removeReferee(referee: Referee) {
        const referees: Referee[] = referee.getCompetition().getReferees();
        const index = referees.indexOf(referee);
        if (index < 0) {
            return;
        }
        const lowerPrioReferees = referees.splice(index);
        lowerPrioReferees.shift(); // referee itself
        let priority = referee.getPriority();
        let removedReferee: Referee | undefined;
        while (removedReferee = lowerPrioReferees.shift()) {
            removedReferee.setPriority(priority++);
            referees.push(removedReferee);
        }
    }
}

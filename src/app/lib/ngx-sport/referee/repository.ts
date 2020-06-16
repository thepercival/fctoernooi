import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../../repository';
import { Referee, RefereeMapper, JsonReferee } from 'ngx-sport';
import { Tournament } from '../../tournament';


@Injectable()
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
        return this.http.post(this.getUrl(tournament) + inviteSuffix, json, this.getOptions()).pipe(
            map((jsonRes: JsonReferee) => this.mapper.toObject(jsonRes, tournament.getCompetition())),
            catchError((err) => this.handleError(err))
        );
    }

    editObject(referee: Referee, tournament: Tournament): Observable<Referee> {
        const url = this.getUrl(tournament) + '/' + referee.getId();
        return this.http.put(url, this.mapper.toJson(referee), this.getOptions()).pipe(
            map((jsonReferee: JsonReferee) => this.mapper.toObject(jsonReferee, tournament.getCompetition(), referee)),
            catchError((err) => this.handleError(err))
        );
    }

    upgradeObject(referee: Referee, tournament: Tournament): Observable<void> {
        const url = this.getUrl(tournament) + '/' + referee.getId() + '/priorityup';
        return this.http.post(url, undefined, this.getOptions()).pipe(
            map(() => {
                const competition = referee.getCompetition();
                const downgrade = competition.getReferee(referee.getPriority() - 1);
                referee.setPriority(downgrade.getPriority());
                downgrade.setPriority(downgrade.getPriority() + 1);
                competition.getReferees().sort((refA, refB) => refA.getPriority() - refB.getPriority());
            }),
            catchError((err) => this.handleError(err))
        );
    }

    removeObject(referee: Referee, tournament: Tournament): Observable<void> {
        const url = this.getUrl(tournament) + '/' + referee.getId();
        return this.http.delete(url, this.getOptions()).pipe(
            map((jsonReferee: JsonReferee) => {
                referee.getCompetition().removeReferee(referee);
            }),
            catchError((err) => this.handleError(err))
        );
    }
}

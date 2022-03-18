import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../../repository';
import { Tournament } from '../../tournament';
import { TournamentUserMapper } from './mapper';
import { TournamentUser } from '../user';
import { JsonTournamentUser } from './json';

@Injectable({
    providedIn: 'root'
})
export class TournamentUserRepository extends APIRepository {

    constructor(
        private http: HttpClient,
        private mapper: TournamentUserMapper) {
        super();
    }

    getUrlpostfix(): string {
        return 'users';
    }


    getUrl(tournament: Tournament): string {
        return super.getApiUrl() + 'tournaments/' + tournament.getId() + '/' + this.getUrlpostfix();
    }

    editObject(tournamentUser: TournamentUser): Observable<TournamentUser> {
        const tournament = tournamentUser.getTournament();
        const url = this.getUrl(tournament) + '/' + tournamentUser.getId();
        return this.http.put<JsonTournamentUser>(url, this.mapper.toJson(tournamentUser), this.getOptions()).pipe(
            map((res: JsonTournamentUser) => this.mapper.toObject(res, tournament, tournamentUser)),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    removeObject(tournamentUser: TournamentUser): Observable<JsonTournamentUser> {
        const tournament = tournamentUser.getTournament();
        const url = this.getUrl(tournament) + '/' + tournamentUser.getId();
        return this.http.delete<JsonTournamentUser>(url, this.getOptions()).pipe(
            map((res: JsonTournamentUser) => {
                const index = tournament.getUsers().indexOf(tournamentUser);
                if (index > -1) {
                    tournament.getUsers().splice(index, 1);
                }

                return res;
            }),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    getEmailaddress(tournamentUser: TournamentUser): Observable<string> {
        const tournament = tournamentUser.getTournament();
        const url = this.getUrl(tournament) + '/' + tournamentUser.getId() + '/emailaddress';
        return this.http.get<JsonTournamentUser>(url, this.getOptions()).pipe(
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }
}

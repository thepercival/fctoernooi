import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../../repository';
import { Tournament } from '../../tournament';
import { TournamentInvitationMapper, JsonTournamentInvitation } from './mapper';
import { TournamentInvitation } from '.';
import { TournamentUser } from '../../tournamentuser';

@Injectable()
export class TournamentInvitationRepository extends APIRepository {

    constructor(
        private http: HttpClient,
        private mapper: TournamentInvitationMapper) {
        super();
    }

    getUrlpostfix(): string {
        return 'invitations';
    }


    getUrl(tournament: Tournament): string {
        return super.getApiUrl() + 'tournaments/' + tournament.getId() + '/' + this.getUrlpostfix();
    }

    getObjects(tournament: Tournament): Observable<TournamentInvitation[]> {
        return this.http.get(this.getUrl(tournament), this.getOptions()).pipe(
            map((jsonInvitations: JsonTournamentInvitation[]) => jsonInvitations.map(jsonInvitation => {
                return this.mapper.toObject(jsonInvitation, tournament);
            })),
            catchError((err) => this.handleError(err))
        );
    }

    createObject(json: JsonTournamentInvitation, tournament: Tournament): Observable<TournamentInvitation> {
        return this.http.post(this.getUrl(tournament), json, this.getOptions()).pipe(
            map((res: JsonTournamentInvitation) => this.mapper.toObject(res, tournament)),
            catchError((err) => this.handleError(err))
        );
    }

    editObject(invitation: TournamentInvitation): Observable<TournamentInvitation> {
        const tournament = invitation.getTournament();
        const url = this.getUrl(tournament) + '/' + invitation.getId();
        return this.http.put(url, this.mapper.toJson(invitation), this.getOptions()).pipe(
            map((res: JsonTournamentInvitation) => this.mapper.toObject(res, tournament)),
            catchError((err) => this.handleError(err))
        );
    }

    removeObject(invitation: TournamentInvitation): Observable<any> {
        const tournament = invitation.getTournament();
        const url = this.getUrl(tournament) + '/' + invitation.getId();
        return this.http.delete(url, this.getOptions()).pipe(
            map((res: any) => { }),
            catchError((err) => this.handleError(err))
        );
    }
}

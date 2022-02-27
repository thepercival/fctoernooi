import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../repository';
import { LockerRoom } from '../lockerroom';
import { Tournament } from '../tournament';
import { LockerRoomMapper } from './mapper';
import { TournamentCompetitor } from '../competitor';
import { CompetitorMapper } from '../competitor/mapper';
import { JsonLockerRoom } from './json';

@Injectable({
    providedIn: 'root'
})
export class LockerRoomRepository extends APIRepository {

    constructor(
        private http: HttpClient,
        private mapper: LockerRoomMapper,
        private competitorMapper: CompetitorMapper) {
        super();
    }

    getUrlpostfix(): string {
        return 'lockerrooms';
    }


    getUrl(tournament: Tournament): string {
        return super.getApiUrl() + 'tournaments/' + tournament.getId() + '/' + this.getUrlpostfix();
    }

    createObject(jsonLockerRoom: JsonLockerRoom, tournament: Tournament): Observable<LockerRoom> {
        return this.http.post<JsonLockerRoom>(this.getUrl(tournament), jsonLockerRoom, this.getOptions()).pipe(
            map((res: JsonLockerRoom) => this.mapper.toObject(res, tournament)),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    editObject(lockerroom: LockerRoom, tournament: Tournament): Observable<LockerRoom> {
        const url = this.getUrl(tournament) + '/' + lockerroom.getId();
        return this.http.put<JsonLockerRoom>(url, this.mapper.toJson(lockerroom), this.getOptions()).pipe(
            map((res: JsonLockerRoom) => this.mapper.toObject(res, tournament, lockerroom)),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    removeObject(lockerRoom: LockerRoom, tournament: Tournament): Observable<any> {
        const url = this.getUrl(tournament) + '/' + lockerRoom.getId();
        return this.http.delete(url, this.getOptions()).pipe(
            map((res: any) => {
                const index = tournament.getLockerRooms().indexOf(lockerRoom);
                if (index > -1) {
                    tournament.getLockerRooms().splice(index, 1);
                }
            }),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    syncCompetitors(lockerRoom: LockerRoom, newCompetitors: TournamentCompetitor[]): Observable<any> {
        const url = this.getUrl(lockerRoom.getTournament()) + '/' + lockerRoom.getId() + '/synccompetitors';

        const json = newCompetitors.map(newCompetitorIt => this.competitorMapper.toJson(newCompetitorIt));
        return this.http.post(url, json, this.getOptions()).pipe(
            map((any) => {
                lockerRoom.getCompetitors().splice(0);
                newCompetitors.forEach((newCompetitorIt: TournamentCompetitor) => (lockerRoom.getCompetitors().push(newCompetitorIt)));
            }),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }
}

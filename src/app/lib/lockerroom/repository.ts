import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../repository';
import { LockerRoom } from '../lockerroom';
import { Tournament } from '../tournament';
import { JsonLockerRoom, LockerRoomMapper } from './mapper';
import { Competitor, CompetitorMapper, JsonCompetitor } from 'ngx-sport';

@Injectable()
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
        return this.http.post(this.getUrl(tournament), jsonLockerRoom, this.getOptions()).pipe(
            map((res: JsonLockerRoom) => this.mapper.toObject(res, tournament)),
            catchError((err) => this.handleError(err))
        );
    }

    editObject(lockerroom: LockerRoom, tournament: Tournament): Observable<LockerRoom> {
        const url = this.getUrl(tournament) + '/' + lockerroom.getId();
        return this.http.put(url, this.mapper.toJson(lockerroom), this.getOptions()).pipe(
            map((res: JsonLockerRoom) => this.mapper.toObject(res, tournament, lockerroom)),
            catchError((err) => this.handleError(err))
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
            catchError((err) => this.handleError(err))
        );
    }

    syncCompetitors(lockerRoom: LockerRoom, newCompetitors: Competitor[]): Observable<any> {
        const url = this.getUrl(lockerRoom.getTournament()) + '/' + lockerRoom.getId() + '/synccompetitors';

        const json = newCompetitors.map(newCompetitor => this.competitorMapper.toJson(newCompetitor));
        return this.http.post(url, json, this.getOptions()).pipe(
            map((any) => {
                lockerRoom.getCompetitors().splice(0);
                newCompetitors.forEach((newCompetitor: Competitor) => (lockerRoom.getCompetitors().push(newCompetitor)));
            }),
            catchError((err) => this.handleError(err))
        );
    }
}
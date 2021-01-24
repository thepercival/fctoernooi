import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Tournament } from '../tournament';
import { TournamentMapper } from './mapper';
import { APIRepository } from '../repository';
import { LockerRoomMapper } from '../lockerroom/mapper';
import { JsonTournament } from './json';
import { TournamentExportAction } from '../../admin/home/exportmodal.component';

/**
 * Created by coen on 1-10-17.
 */
@Injectable()
export class TournamentRepository extends APIRepository {

    private url: string;

    constructor(
        private http: HttpClient,
        private mapper: TournamentMapper,
        private lockerRoomMapper: LockerRoomMapper) {
        super();
        this.url = super.getApiUrl() + this.getUrlpostfix();
    }

    getUrlpostfix(): string {
        return 'tournaments';
    }

    getUrl(tournament?: Tournament): string {
        return this.url + (tournament ? ('/' + tournament.getId()) : '');
    }

    getObject(id: number | string): Observable<Tournament> {
        const url = super.getApiUrl() + (this.getToken() === undefined ? 'public/' : '') + this.getUrlpostfix() + '/' + id;
        return this.http.get<JsonTournament>(url, { headers: super.getHeaders() }).pipe(
            map((jsonTournament: JsonTournament) => this.mapper.toObject(jsonTournament)),
            catchError((err) => this.handleError(err))
        );
    }

    getUserRefereeId(tournament: Tournament): Observable<number> {
        if (this.getToken() === undefined) {
            return of(0);
        }
        const url = this.getUrl(tournament) + '/userrefereeid';
        return this.http.get<JsonTournament>(url, { headers: super.getHeaders() }).pipe(
            // map((userRefereeId: number) => userRefereeId),
            catchError((err) => this.handleError(err))
        );
    }

    createObject(json: JsonTournament): Observable<Tournament> {
        return this.http.post(this.url, json, { headers: super.getHeaders() }).pipe(
            map((jsonTournament: JsonTournament) => this.mapper.toObject(jsonTournament)),
            catchError((err) => this.handleError(err))
        );
    }

    editObject(tournament: Tournament): Observable<Tournament> {
        const url = this.getUrl(tournament);
        return this.http.put(url, this.mapper.toJson(tournament), { headers: super.getHeaders() }).pipe(
            map((res: JsonTournament) => {
                return this.mapper.toObject(res);
            }),
            catchError((err) => this.handleError(err))
        );
    }

    removeObject(tournament: Tournament): Observable<boolean> {
        const url = this.getUrl(tournament);
        return this.http.delete(url, { headers: super.getHeaders() }).pipe(
            map((res) => true),
            catchError((err) => this.handleError(err))
        );
    }

    copyObject(tournament: Tournament, newStartDateTime: Date): Observable<number> {
        const url = this.getUrl(tournament) + '/copy';
        return this.http.post(url, { startdatetime: newStartDateTime }, this.getOptions()).pipe(
            map((id: number) => id),
            catchError((err) => this.handleError(err))
        );
    }

    sendRequestOldStructure(tournamentId: number): Observable<boolean> {
        const url = this.getUrl() + '/' + tournamentId + '/sendrequestoldstructure';
        return this.http.post(url, null, this.getOptions()).pipe(
            map((retVal: boolean) => retVal),
            catchError((err) => this.handleError(err))
        );
    }

    getExportUrl(tournament: Tournament, exportAction: TournamentExportAction): Observable<string> {

        const url = this.getUrl() + '/' + tournament.getId() + '/exportgeneratehash';
        return this.http.get(url, this.getOptions()).pipe(
            map((jsonHash: TournamentExportHash) => {
                const exportUrl = super.getApiUrl() + 'public/' + this.getUrlpostfix() + '/' + tournament.getId() + '/export';
                return exportUrl + '?subjects=' + exportAction.subjects + '&format=' + exportAction.format + '&hash=' + jsonHash.hash;
            }),
            catchError((err) => this.handleError(err))
        );
    }
}

export interface TournamentExportHash {
    hash: string;
}

export enum TournamentExportConfig {
    gameNotes = 1,
    structure = 2,
    gamesPerPoule = 4,
    gamesPerField = 8,
    planning = 16,
    poulePivotTables = 32,
    lockerRooms = 64,
    qrCode = 128
}

export enum TournamentExportFormat { Pdf, Excel }
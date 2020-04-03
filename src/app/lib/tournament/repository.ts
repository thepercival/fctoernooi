import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Role } from '../role';
import { JsonRole, RoleMapper } from '../role/mapper';
import { Tournament } from '../tournament';
import { JsonTournament, TournamentMapper } from './mapper';
import { APIRepository } from '../repository';
import { JsonLockerRoom, LockerRoomMapper } from '../lockerroom/mapper';
import { LockerRoom } from '../lockerroom';

/**
 * Created by coen on 1-10-17.
 */
@Injectable()
export class TournamentRepository extends APIRepository {

    private url: string;

    constructor(
        private http: HttpClient,
        private mapper: TournamentMapper,
        private roleMapper: RoleMapper,
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

    getObject(id: number): Observable<Tournament> {
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

    createObject(tournament: Tournament): Observable<Tournament> {
        return this.http.post(this.url, this.mapper.toJson(tournament), { headers: super.getHeaders() }).pipe(
            map((res: JsonTournament) => this.mapper.toObject(res)),
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

    syncLockerRooms(tournament: Tournament): Observable<LockerRoom[]> {
        const url = this.getUrl(tournament) + '/lockerrooms';

        const json = tournament.getLockerRooms().map(lockerRoom => this.lockerRoomMapper.toJson(lockerRoom));
        return this.http.post(url, json, this.getOptions()).pipe(
            map((jsonLockerRooms: JsonLockerRoom[]) => {
                const lockerRooms = tournament.getLockerRooms();
                lockerRooms.splice(0, lockerRooms.length);
                jsonLockerRooms.map(jsonLockerRoom => this.lockerRoomMapper.toObject(jsonLockerRoom, tournament));
                return lockerRooms;
            }),
            catchError((err) => this.handleError(err))
        );
    }

    syncRefereeRoles(tournament: Tournament): Observable<Role[]> {
        const url = this.getUrl(tournament) + '/syncrefereeroles';
        return this.http.post(url, null, this.getOptions()).pipe(
            map((jsonRoles: JsonRole[]) => jsonRoles.map(jsonRole => this.roleMapper.toObject(jsonRole, tournament))),
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

    getExportUrl(tournament: Tournament, exportType: string, exportConfig: TournamentExportConfig): Observable<string> {

        const url = this.getUrl() + '/' + tournament.getId() + '/exportgeneratehash';
        return this.http.get(url, this.getOptions()).pipe(
            map((jsonHash: TournamentExportHash) => {
                const exportUrl = super.getApiUrl() + 'public/' + this.getUrlpostfix() + '/' + tournament.getId() + '/export';
                return exportUrl +
                    '?gamenotes=' + exportConfig.gamenotes +
                    '&structure=' + exportConfig.structure +
                    '&rules=' + exportConfig.rules +
                    '&gamesperpoule=' + exportConfig.gamesperpoule +
                    '&gamesperfield=' + exportConfig.gamesperfield +
                    '&planning=' + exportConfig.planning +
                    '&poulepivottables=' + exportConfig.poulepivottables +
                    '&qrcode=' + exportConfig.qrcode +
                    '&type=' + exportType +
                    '&hash=' + jsonHash.hash;
            }),
            catchError((err) => this.handleError(err))
        );
    }
}

export interface TournamentExportHash {
    hash: string;
}

export interface TournamentExportConfig {
    gamenotes: boolean;
    structure: boolean;
    rules: boolean;
    gamesperpoule: boolean;
    gamesperfield: boolean;
    planning: boolean;
    poulepivottables: boolean;
    qrcode: boolean;
}

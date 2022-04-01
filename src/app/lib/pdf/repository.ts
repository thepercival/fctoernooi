import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Tournament } from '../tournament';
import { APIRepository } from '../repository';
import { TournamentMapper } from '../tournament/mapper';

@Injectable({
    providedIn: 'root'
})
export class PdfRepository extends APIRepository {

    constructor(
        private http: HttpClient,
        private mapper: TournamentMapper) {
        super();
    }

    getUrlpostfix(): string {
        return 'pdf';
    }


    getUrl(tournament: Tournament): string {
        return super.getApiUrl() + 'tournaments/' + tournament.getId() + '/' + this.getUrlpostfix();
    }

    createObject(tournament: Tournament, subjects: number): Observable<string> {
        return this.http.post<string>(this.getUrl(tournament), { subjects: subjects }, { headers: super.getHeaders() }).pipe(
            map((jsonHash: any) => jsonHash.hash),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    progress(tournament: Tournament, hash: string): Observable<number> {
        const url = this.getUrl(tournament) + '/progress/' + hash;
        return this.http.get<number>(url, this.getOptions()).pipe(
            map((jsonProgress: any) => jsonProgress.progress),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    getPdfUrl(tournament: Tournament, hash: string): string {
        return super.getApiUrl() + 'public/tournaments/' + tournament.getId() + '/pdf?hash=' + hash;
    }
}

export interface TournamentExportHash {
    hash: string;
}

export enum TournamentExportConfig {
    structure = 1,
    poulePivotTables = 2,
    planning = 4,
    gamesPerPoule = 8,
    gamesPerField = 16,
    gameNotes = 32,
    lockerRooms = 64,
    qrCode = 128
}
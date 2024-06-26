import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Tournament } from '../tournament';
import { APIRepository } from '../repository';
import { TournamentMapper } from '../tournament/mapper';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class PdfRepository extends APIRepository {

    constructor(
        private http: HttpClient,
        private router: Router) {
        super(router);
    }

    getUrlpostfix(): string {
        return 'pdf';
    }


    getUrl(tournament: Tournament): string {
        return super.getApiUrl() + 'tournaments/' + tournament.getId() + '/' + this.getUrlpostfix();
    }

    createObject(tournament: Tournament, subjects: number): Observable<string> {
        return this.http.post<string>(this.getUrl(tournament), { subjects: subjects }, { headers: super.getHeaders() }).pipe(
            map((jsonFileName: any) => jsonFileName.fileName),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    applyService(tournament: Tournament): Observable<void> {
        const url = this.getUrl(tournament)  + '/apply-service';
        return this.http.post<void>(url, undefined, { headers: super.getHeaders() }).pipe(
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    progress(tournament: Tournament): Observable<number> {
        const url = this.getUrl(tournament) + '/progress';
        return this.http.get<number>(url, this.getOptions()).pipe(
            map((jsonProgress: any) => jsonProgress.progress),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    getPdfUrl(tournament: Tournament, fileName: string): string {
        return super.getApiUrl() + 'pdf/' + fileName + '.pdf';
    }
}

export enum TournamentExportConfig {
    structure = 1,
    poulePivotTables = 2,
    planning = 4,
    gamesPerPoule = 8,
    gamesPerField = 16,
    gameNotes = 32,
    lockerRooms = 64,
    qrCode = 128,
    registrationForm = 256,
}
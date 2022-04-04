import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APIRepository } from '../../repository';
import { Tournament } from '../../tournament';
import { ScreenConfig } from './json';


@Injectable({
    providedIn: 'root'
})
export class ScreenConfigRepository extends APIRepository {

    constructor(
        private http: HttpClient) {
        super();
    }

    getUrlpostfix(): string {
        return 'liveboardscreenconfigs';
    }


    getUrl(tournament: Tournament): string {
        return super.getApiUrl() + 'tournaments/' + tournament.getId() + '/' + this.getUrlpostfix();
    }

    getObjects(tournament: Tournament): Observable<ScreenConfig[]> {
        tournament.getCompetitors().splice(0);
        return this.http.get<ScreenConfig[]>(this.getUrl(tournament), this.getOptions()).pipe(
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    createObject(screenConfig: ScreenConfig, tournament: Tournament): Observable<ScreenConfig> {
        return this.http.post<ScreenConfig>(this.getUrl(tournament), screenConfig, this.getOptions()).pipe(
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    editObject(screenConfig: ScreenConfig, tournament: Tournament): Observable<ScreenConfig> {
        const url = this.getUrl(tournament) + '/' + screenConfig.id;
        return this.http.put<ScreenConfig>(url, screenConfig, this.getOptions()).pipe(
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }
}



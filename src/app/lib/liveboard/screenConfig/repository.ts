import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APIRepository } from '../../repository';
import { Tournament } from '../../tournament';
import { ScreenConfig } from './json';
import { ScreenConfigName } from './name';


@Injectable({
    providedIn: 'root'
})
export class ScreenConfigRepository {

    protected identifier = 'screenRefreshConfigs-';

    constructor() { }

    hasObjects(tournament: Tournament): boolean {
        return localStorage.getItem(this.getId(tournament)) !== null;
    }

    getObjects(tournament: Tournament): Observable<ScreenConfig[]> {
        const items = localStorage.getItem(this.getId(tournament));
        if (items === null) {
            return of(this.getDefaultObjects());
        }
        return of(JSON.parse(items));
    }

    saveObjects(tournament: Tournament, screenConfigs: ScreenConfig[]): Observable<undefined> {
        localStorage.setItem(this.getId(tournament), JSON.stringify(screenConfigs));
        return of(undefined);
    }

    getId(tournament: Tournament): string {
        return this.identifier + tournament.getId();
    }

    getDefaultObjects(): ScreenConfig[] {
        return [
            ScreenConfigName.EndRanking,
            ScreenConfigName.PoulesRanking,
            ScreenConfigName.Schedule,
            ScreenConfigName.Results,
            ScreenConfigName.Sponsors
        ].map((name: ScreenConfigName): ScreenConfig => {
            return { name, enabled: true, nrOfSeconds: 15 };
        });
    }

    /*
        
    
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
        }*/
}



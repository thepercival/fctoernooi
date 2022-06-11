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
        const screenConfigs = this.getDefaultObjects();
        const items = localStorage.getItem(this.getId(tournament));
        if (items === null) {
            return of(screenConfigs);
        }
        const localScreenConfigs = JSON.parse(items);
        return of(
            screenConfigs.map((screenConfig: ScreenConfig): ScreenConfig => {
                const localScreenConfig = localScreenConfigs.find((screenConfigIt: ScreenConfig) => screenConfigIt.name === screenConfig.name);
                if (localScreenConfig !== undefined) {
                    screenConfig.enabled = localScreenConfig.enabled;
                    screenConfig.nrOfSeconds = localScreenConfig.nrOfSeconds;
                }
                return screenConfig;
            })
        );
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
}



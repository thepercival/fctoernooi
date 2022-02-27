import { Injectable } from '@angular/core';
import { JsonScreenRefreshConfig } from '../screenRefreshConfig';

@Injectable({
    providedIn: 'root'
})
export class ScreenRefreshConfigBackEnd {

    protected identifier = 'screenRefreshConfig';
    private static readonly DefaultRefreshSeconds = 15;

    constructor() { }

    get(): JsonScreenRefreshConfig {
        const refreshCOnfig = localStorage.getItem(this.identifier);
        if (refreshCOnfig) {
            return JSON.parse(refreshCOnfig);
        }
        return {
            poulesRanking: ScreenRefreshConfigBackEnd.DefaultRefreshSeconds,
            endRanking: ScreenRefreshConfigBackEnd.DefaultRefreshSeconds,
            schedule: ScreenRefreshConfigBackEnd.DefaultRefreshSeconds,
            results: ScreenRefreshConfigBackEnd.DefaultRefreshSeconds,
            sponsors: ScreenRefreshConfigBackEnd.DefaultRefreshSeconds
        }
    }

    edit(json: JsonScreenRefreshConfig) {
        localStorage.setItem(this.identifier, JSON.stringify(json));
    }
}
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Router } from '@angular/router';
import { APIRepository } from '../../repository';
import { Tournament } from '../../tournament';
import { JsonRegistrationSettings } from './settings/json';
import { TournamentRegistrationSettingsMapper } from './settings/mapper';
import { TournamentRegistrationSettings } from './settings';
import { JsonTournamentRegistration } from './json';
import { TournamentRegistrationMapper } from './mapper';
import { TournamentRegistration } from '../registration';
import { Category } from 'ngx-sport';
import { TournamentRegistrationTextSubject } from './text';

@Injectable({
    providedIn: 'root'
})
export class TournamentRegistrationRepository extends APIRepository {

    constructor(
        private http: HttpClient,
        private mapper: TournamentRegistrationMapper, 
        private settingsMapper: TournamentRegistrationSettingsMapper,
        router: Router) {
        super(router);
    }

    getUrlpostfix(postfix: string|undefined = undefined ): string {
        return 'registrations' + (postfix !== undefined ? ('/' + postfix) : '');
    }

    getSettingsUrl(tournament: Tournament): string {
        const prefix = this.getToken() ? '' : 'public/';
        return super.getApiUrl() + prefix + 'tournaments/' + tournament.getId() + '/' + this.getUrlpostfix('settings');
    }

    getTextUrl(tournament: Tournament, textSubject: TournamentRegistrationTextSubject): string {
        return super.getApiUrl() + 'tournaments/' + tournament.getId() + '/registrationsubjects/' + textSubject;
    }

    getObject(registrationId: number, category: Category, tournament: Tournament): Observable<TournamentRegistration> {
        const url = super.getApiUrl() + 'tournaments/' + tournament.getId() + '/categories/' + category.getId() + '/' + this.getUrlpostfix('' + registrationId);
        return this.http.get<JsonTournamentRegistration>(url, this.getOptions()).pipe(
            map((jsonRegistration: JsonTournamentRegistration) => this.mapper.toObject(jsonRegistration, category)),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        )
    }

    getObjects(category: Category, tournament: Tournament): Observable<TournamentRegistration[]> {
        const url = super.getApiUrl() + 'tournaments/' + tournament.getId() + '/categories/' + category.getId() + '/' + this.getUrlpostfix();
        return this.http.get<JsonTournamentRegistration[]>(url, this.getOptions()).pipe(
            map((jsonInvitations: JsonTournamentRegistration[]) => jsonInvitations.map((jsonRegistration: JsonTournamentRegistration) => {
                return this.mapper.toObject(jsonRegistration, category);
            })),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        )
    }

    createObject(jsonRegistration: JsonTournamentRegistration, category: Category, tournament: Tournament): Observable<TournamentRegistration> {
        const url = super.getApiUrl() + 'public/tournaments/' + tournament.getId() + '/categories/' + category.getId() + '/' + this.getUrlpostfix();
        return this.http.post<JsonTournamentRegistration>(url, jsonRegistration, this.getOptions()).pipe(
            map((jsonRegistration: JsonTournamentRegistration) => this.mapper.toObject(jsonRegistration, category)),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    editObject(jsonRegistration: JsonTournamentRegistration, registration: TournamentRegistration, tournament: Tournament): Observable<TournamentRegistration> {
        const category = registration.getCategory();
        const url = super.getApiUrl() + 'tournaments/' + tournament.getId() + '/categories/' + category.getId() + '/' + this.getUrlpostfix('' + registration.getId());
        return this.http.put<JsonTournamentRegistration>(url, jsonRegistration, this.getOptions()).pipe(
            map((jsonRegistration: JsonTournamentRegistration) => this.mapper.updateObject(jsonRegistration, registration)),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    removeObject(registration: TournamentRegistration, tournament: Tournament): Observable<void> {
        const category = registration.getCategory();
        const url = super.getApiUrl() + 'tournaments/' + tournament.getId() + '/categories/' + category.getId() + '/' + this.getUrlpostfix('' + registration.getId());
        return this.http.delete(url, this.getOptions()).pipe(
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    getSettings(tournament: Tournament): Observable<TournamentRegistrationSettings> {
        return this.http.get<JsonRegistrationSettings>(this.getSettingsUrl(tournament), this.getOptions()).pipe(
            map((json: JsonRegistrationSettings): TournamentRegistrationSettings => {
                return this.settingsMapper.toObject(json);
            }),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    editSettings(jsonSettings: JsonRegistrationSettings, tournament: Tournament): Observable<TournamentRegistrationSettings> {
        const url = this.getSettingsUrl(tournament) + '/' + jsonSettings.id;
        return this.http.put<JsonRegistrationSettings>(url, jsonSettings, this.getOptions()).pipe(
            map((json: JsonRegistrationSettings): TournamentRegistrationSettings => {
                return this.settingsMapper.toObject(json);
            }),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    getText(tournament: Tournament, textSubject: TournamentRegistrationTextSubject): Observable<string> {
        return this.http.get(this.getTextUrl(tournament, textSubject), { headers: this.getBaseHeaders(), responseType: 'text'}).pipe(
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    editText(text: string, tournament: Tournament, textSubject: TournamentRegistrationTextSubject): Observable<string> {
        return this.http.put(this.getTextUrl(tournament, textSubject), text, { headers: this.getBaseHeaders(), responseType: 'text' }).pipe(
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }
}

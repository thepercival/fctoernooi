import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JsonCompetition, CompetitionMapper, SportConfig, SportRepository } from 'ngx-sport';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Tournament } from '../tournament';
import { TournamentRole } from './role';
import { ITournamentRole, TournamentRoleRepository } from './role/repository';
import { ISponsor, SponsorRepository } from './sponsor/repository';

/**
 * Created by coen on 1-10-17.
 */
@Injectable()
export class TournamentRepository extends SportRepository {

    private url: string;

    constructor(
        private http: HttpClient,
        private csMapper: CompetitionMapper,
        private tournamentRoleRepository: TournamentRoleRepository,
        private sponsorRepository: SponsorRepository,
        router: Router) {
        super(router);
        this.tournamentRoleRepository = tournamentRoleRepository;
        this.url = super.getApiUrl() + this.getUrlpostfix();
    }

    getUrlpostfix(): string {
        return 'tournaments';
    }

    getUrl(): string {
        return this.url;
    }

    getShells(filter?: TournamentShellFilter): Observable<TournamentShell[]> {
        const postUrl = ((SportConfig.getToken() === undefined) ? 'public' : '');
        const options = {
            headers: super.getHeaders(),
            params: this.getHttpParams(filter)
        };
        return this.http.get<TournamentShell[]>(this.url + postUrl, options).pipe(
            map((jsonShells: TournamentShell[]) => this.jsonArrayToShell(jsonShells)),
            catchError((err) => this.handleError(err))
        );
    }

    getHttpParams(filter?: TournamentShellFilter): HttpParams {
        let httpParams = new HttpParams();
        if (filter === undefined) {
            return httpParams;
        }
        if (filter.withRoles !== undefined && SportConfig.getToken() !== undefined) {
            httpParams = httpParams.set('withRoles', filter.withRoles ? 'true' : 'false');
        }
        if (filter.minDate !== undefined) {
            httpParams = httpParams.set('minDate', filter.minDate.toISOString());
        }
        if (filter.maxDate !== undefined) {
            httpParams = httpParams.set('maxDate', filter.maxDate.toISOString());
        }
        if (filter.name !== undefined) {
            httpParams = httpParams.set('name', filter.name);
        }
        return httpParams;
    }

    getObject(id: number): Observable<Tournament> {
        const postUrl = SportConfig.getToken() === undefined ? 'public' : '';
        return this.http.get<ITournament>(this.url + postUrl + '/' + id, { headers: super.getHeaders() }).pipe(
            map((jsonTournament: ITournament) => this.jsonToObject(jsonTournament)),
            catchError((err) => this.handleError(err))
        );
    }

    getUserRefereeId(tournament: Tournament): Observable<number> {
        if (SportConfig.getToken() === undefined) {
            return of(0);
        }
        return this.http.get<ITournament>(this.url + '/userrefereeid/' + tournament.getId(), { headers: super.getHeaders() }).pipe(
            // map((userRefereeId: number) => userRefereeId),
            catchError((err) => this.handleError(err))
        );
    }

    createObject(tournament: Tournament): Observable<Tournament> {
        return this.http.post(this.url, this.objectToJson(tournament), { headers: super.getHeaders() }).pipe(
            map((res: ITournament) => this.jsonToObject(res)),
            catchError((err) => this.handleError(err))
        );
    }

    editObject(tournament: Tournament): Observable<Tournament> {
        const url = this.url + '/' + tournament.getId();
        return this.http.put(url, this.objectToJson(tournament), { headers: super.getHeaders() }).pipe(
            map((res: ITournament) => {
                return this.jsonToObject(res);
            }),
            catchError((err) => this.handleError(err))
        );
    }

    removeObject(tournament: Tournament): Observable<boolean> {
        const url = this.url + '/' + tournament.getId();
        return this.http.delete(url, { headers: super.getHeaders() }).pipe(
            map((res) => true),
            catchError((err) => this.handleError(err))
        );
    }

    syncRefereeRoles(tournament: Tournament): Observable<TournamentRole[]> {
        const url = this.url + '/syncrefereeroles/' + tournament.getId();
        return this.http.post(url, null, { headers: super.getHeaders() }).pipe(
            map((roles: ITournamentRole[]) => this.tournamentRoleRepository.jsonArrayToObject(roles, tournament)),
            catchError((err) => this.handleError(err))
        );
    }

    jsonArrayToObject(jsonArray: ITournament[]): Tournament[] {
        const tournaments: Tournament[] = [];
        for (const json of jsonArray) {
            const object = this.jsonToObject(json);
            tournaments.push(object);
        }
        return tournaments;
    }

    jsonToObject(json: ITournament): Tournament {
        const competition = this.csMapper.toObject(json.competition);
        const tournament = new Tournament(competition);
        const roles = this.tournamentRoleRepository.jsonArrayToObject(json.roles ? json.roles : [], tournament);
        this.sponsorRepository.jsonArrayToObject(json.sponsors, tournament);
        tournament.setRoles(roles);
        tournament.setId(json.id);
        if (json.breakStartDateTime !== undefined) {
            tournament.setBreakStartDateTime(new Date(json.breakStartDateTime));
        }
        tournament.setBreakDuration(json.breakDuration);
        return tournament;
    }

    objectToJson(tournament: Tournament): ITournament {
        return {
            id: tournament.getId(),
            competition: this.csMapper.toJson(tournament.getCompetition()),
            roles: this.tournamentRoleRepository.objectsToJsonArray(tournament.getRoles()),
            sponsors: this.sponsorRepository.objectsToJsonArray(tournament.getSponsors()),
            breakStartDateTime: tournament.getBreakStartDateTime() ? tournament.getBreakStartDateTime().toISOString() : undefined,
            breakDuration: tournament.getBreakDuration(),
        };
    }

    jsonArrayToShell(jsonArray: TournamentShell[]): TournamentShell[] {
        for (const json of jsonArray) {
            json.startDateTime = new Date(json.startDateTime);
        }
        return jsonArray;
    }

    getPrintUrl(tournament: Tournament, printConfig: TournamentPrintConfig): string {
        return this.getUrl() + 'public/pdf/' + tournament.getId() +
            '?gamenotes=' + printConfig.gamenotes +
            '&structure=' + printConfig.structure +
            '&rules=' + printConfig.rules +
            '&gamesperfield=' + printConfig.gamesperfield +
            '&planning=' + printConfig.planning +
            '&poulepivottables=' + printConfig.poulepivottables + 
            '&qrcode=' + printConfig.qrcode;
    }
}

export interface ITournament {
    id?: number;
    competition: JsonCompetition;
    breakStartDateTime?: string;
    breakDuration?: number;
    roles: ITournamentRole[];
    sponsors: ISponsor[];
}

export interface TournamentShell {
    tournamentId: number;
    sport: string;
    name: string;
    startDateTime: Date;
    hasEditPermissions: boolean;
}

export interface TournamentShellFilter {
    minDate?: Date;
    maxDate?: Date;
    name?: string;
    withRoles?: boolean;
}

export interface TournamentPrintConfig {
    gamenotes: boolean;
    structure: boolean;
    rules: boolean;
    gamesperfield: boolean;
    planning: boolean;
    poulepivottables: boolean;
    qrcode: boolean;
}

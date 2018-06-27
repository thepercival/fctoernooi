import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CompetitionRepository, ICompetition, SportConfig, SportRepository } from 'ngx-sport';
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
    private csRepository: CompetitionRepository;

    constructor(
        private http: HttpClient,
        csRepository: CompetitionRepository,
        private tournamentRoleRepository: TournamentRoleRepository,
        private sponsorRepository: SponsorRepository,
        router: Router) {
        super(router);
        this.csRepository = csRepository;
        this.tournamentRoleRepository = tournamentRoleRepository;
        this.url = super.getApiUrl() + this.getUrlpostfix();
    }

    getUrlpostfix(): string {
        return 'tournaments';
    }

    getUrl(): string {
        return this.url;
    }

    getShells(filter: TournamentShellFilter): Observable<TournamentShell[]> {
        const postUrl = SportConfig.getToken() === undefined ? 'public' : '';
        const options = {
            headers: super.getHeaders(),
            params: this.getHttpParams(filter)
        };
        return this.http.get<TournamentShell[]>(this.url + postUrl, options).pipe(
            map((jsonShells: TournamentShell[]) => this.jsonArrayToShell(jsonShells)),
            catchError((err) => this.handleError(err))
        );
    }

    getHttpParams(filter: TournamentShellFilter): HttpParams {
        let httpParams = new HttpParams();
        if (filter.minDate !== undefined) {
            httpParams = httpParams.set('minDate', filter.minDate.toISOString());
        }
        if (filter.maxDate !== undefined) {
            httpParams = httpParams.set('maxDate', filter.minDate.toISOString());
        }
        return httpParams;
    }

    getObject(id: number): Observable<Tournament> {
        const postUrl = SportConfig.getToken() === undefined ? 'public' : '';
        return this.http.get<ITournament>(this.url + postUrl + '/' + id, { headers: super.getHeaders() }).pipe(
            map((jsonTournament: ITournament) => this.jsonToObjectHelper(jsonTournament)),
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
        return this.http.post(this.url, this.objectToJsonHelper(tournament), { headers: super.getHeaders() }).pipe(
            map((res: ITournament) => this.jsonToObjectHelper(res)),
            catchError((err) => this.handleError(err))
        );
    }

    editObject(tournament: Tournament): Observable<Tournament> {
        const url = this.url + '/' + tournament.getId();
        return this.http.put(url, this.objectToJsonHelper(tournament), { headers: super.getHeaders() }).pipe(
            map((res: ITournament) => {
                return this.jsonToObjectHelper(res);
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
            const object = this.jsonToObjectHelper(json);
            tournaments.push(object);
        }
        return tournaments;
    }

    jsonToObjectHelper(json: ITournament): Tournament {
        const competition = this.csRepository.jsonToObjectHelper(json.competition);
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

    objectToJsonHelper(tournament: Tournament): ITournament {
        return {
            id: tournament.getId(),
            competition: this.csRepository.objectToJsonHelper(tournament.getCompetition()),
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

    getPdfUrl(tournament: Tournament): string {
        return this.getUrl() + 'public/pdf/' + tournament.getId();
    }
}

export interface ITournament {
    id?: number;
    competition: ICompetition;
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
    editPermissions: boolean;
}

export interface TournamentShellFilter {
    minDate?: Date;
    maxDate?: Date;
}

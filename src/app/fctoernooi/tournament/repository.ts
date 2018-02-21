/**
 * Created by coen on 1-10-17.
 */
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CompetitionseasonRepository, ICompetitionseason, SportRepository } from 'ngx-sport';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { catchError } from 'rxjs/operators/catchError';
import { map } from 'rxjs/operators/map';

import { Tournament } from '../tournament';
import { ITournamentRole, TournamentRoleRepository } from './role/repository';

@Injectable()
export class TournamentRepository extends SportRepository {

    private url: string;
    private csRepository: CompetitionseasonRepository;
    private tournamentRoleRepository: TournamentRoleRepository;
    private ownCache: Tournament[] = [];

    constructor(
        private http: HttpClient,
        csRepository: CompetitionseasonRepository,
        tournamentRoleRepository: TournamentRoleRepository,
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

    getObjects(startDateTime: Date, endDateTime: Date): Observable<Tournament[]> {

        this.ownCache = [];

        let httpParams = new HttpParams();
        httpParams = httpParams.set('startDateTime', startDateTime.toISOString());
        httpParams = httpParams.set('endDateTime', endDateTime.toISOString());
        const options = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
            params: httpParams
        };

        return this.http.get<ITournament[]>(this.url, options).pipe(
            map((jsonTournaments: ITournament[]) => {
                const tournamentsRes = this.jsonArrayToObject(jsonTournaments);
                this.ownCache = tournamentsRes;
                return tournamentsRes;
            }),
            catchError((err) => this.handleError(err))
        );

    }

    getObject(id: number): Observable<Tournament> {
        const tournament = this.ownCache.find(
            tournamentIt => tournamentIt.getId() === id
        );
        if (tournament) {
            return Observable.create((observer: Observer<Tournament>) => {
                observer.next(tournament);
                observer.complete();
            });
        }

        const headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
        return this.http.get<ITournament>(this.url + '/' + id, { headers: headers }).pipe(
            map((jsonTournament: ITournament) => {
                const tournamentRes = this.jsonToObjectHelper(jsonTournament);
                this.ownCache.push(tournamentRes);
                return tournamentRes;
            }),
            catchError((err) => this.handleError(err))
        );
    }

    createObject(tournament: Tournament): Observable<Tournament> {
        return this.http.post(this.url, this.objectToJsonHelper(tournament), { headers: super.getHeaders() }).pipe(
            map((res: ITournament) => {
                const tournamentIn = this.jsonToObjectHelper(res);
                this.ownCache.push(tournamentIn);
                return tournamentIn;
            }),
            catchError((err) => this.handleError(err))
        );
    }

    editObject(tournament: Tournament): Observable<Tournament> {
        const url = this.url + '/' + tournament.getId();
        return this.http.put(url, this.objectToJsonHelper(tournament), { headers: super.getHeaders() }).pipe(
            map((res: ITournament) => {
                console.log(res); return this.jsonToObjectHelper(res);
            }),
            catchError((err) => this.handleError(err))
        );
    }

    removeObject(tournament: Tournament): Observable<boolean> {
        const url = this.url + '/' + tournament.getId();
        return this.http.delete(url, { headers: super.getHeaders() }).pipe(
            map((res) => {
                const index = this.ownCache.indexOf(tournament);
                if (index > -1) {
                    this.ownCache.splice(index, 1);
                }
                return true;
            }),
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
        const competitionseason = this.csRepository.jsonToObjectHelper(json.competitionseason);
        const tournament = new Tournament(competitionseason);
        const roles = this.tournamentRoleRepository.jsonArrayToObject(json.roles, tournament);
        tournament.setRoles(roles);
        tournament.setId(json.id);
        return tournament;
    }

    objectToJsonHelper(object: Tournament): ITournament {
        return {
            id: object.getId(),
            competitionseason: this.csRepository.objectToJsonHelper(object.getCompetitionseason()),
            roles: this.tournamentRoleRepository.objectsToJsonHelper(object.getRoles())
        };
    }
}

export interface ITournament {
    id?: number;
    competitionseason: ICompetitionseason;
    roles: ITournamentRole[];
}

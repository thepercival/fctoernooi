import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CompetitionRepository, ICompetition, SportRepository } from 'ngx-sport';
import { Observable ,  Observer } from 'rxjs';
import { catchError ,  map } from 'rxjs/operators';

import { Tournament } from '../tournament';
import { ITournamentRole, TournamentRoleRepository } from './role/repository';
import { ISponsor, SponsorRepository } from './sponsor/repository';

/**
 * Created by coen on 1-10-17.
 */
@Injectable()
export class TournamentRepository extends SportRepository {

    private url: string;
    private csRepository: CompetitionRepository;
    private ownCache: Tournament[] = [];

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
                return this.jsonToObjectHelper(res);
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
        const competition = this.csRepository.jsonToObjectHelper(json.competition);
        const tournament = new Tournament(competition);
        const roles = this.tournamentRoleRepository.jsonArrayToObject(json.roles, tournament);
        this.sponsorRepository.jsonArrayToObject(json.sponsors, tournament);
        tournament.setRoles(roles);
        tournament.setId(json.id);
        return tournament;
    }

    objectToJsonHelper(tournament: Tournament): ITournament {
        return {
            id: tournament.getId(),
            competition: this.csRepository.objectToJsonHelper(tournament.getCompetition()),
            roles: this.tournamentRoleRepository.objectsToJsonArray(tournament.getRoles()),
            sponsors: this.sponsorRepository.objectsToJsonArray(tournament.getSponsors()),
        };
    }
}

export interface ITournament {
    id?: number;
    competition: ICompetition;
    roles: ITournamentRole[];
    sponsors: ISponsor[];
}

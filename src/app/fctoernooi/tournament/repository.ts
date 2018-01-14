/**
 * Created by coen on 1-10-17.
 */
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CompetitionseasonRepository, ICompetitionseason, SportRepository } from 'ngx-sport';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { Tournament } from '../tournament';
import { ITournamentRole, TournamentRoleRepository } from './role/repository';

@Injectable()
export class TournamentRepository extends SportRepository {

    private url: string;
    private csRepository: CompetitionseasonRepository;
    private tournamentRoleRepository: TournamentRoleRepository;
    private cache: Tournament[] = [];

    constructor(private http: HttpClient, csRepository: CompetitionseasonRepository, tournamentRoleRepository: TournamentRoleRepository) {
        super();
        this.csRepository = csRepository;
        this.tournamentRoleRepository = tournamentRoleRepository;
        this.url = super.getApiUrl() + this.getUrlpostfix();
    }

    getUrlpostfix(): string {
        return 'tournaments';
    }

    getObjects(startDateTime: Date, endDateTime: Date): Observable<Tournament[]> {

        this.cache = [];

        let httpParams = new HttpParams();
        httpParams = httpParams.set('startDateTime', startDateTime.toISOString());
        httpParams = httpParams.set('endDateTime', endDateTime.toISOString());
        const options = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
            params: httpParams
        };

        return this.http.get<ITournament[]>(this.url, options)
            .map((jsonTournaments: ITournament[]) => {
                const tournamentsRes = this.jsonArrayToObject(jsonTournaments);
                this.cache = tournamentsRes;
                return tournamentsRes;
            })
            .catch(this.handleError);
    }

    getObject(id: number): Observable<Tournament> {
        const tournament = this.cache.find(
            tournamentIt => tournamentIt.getId() === id
        );
        if (tournament) {
            return Observable.create((observer: Observer<Tournament>) => {
                observer.next(tournament);
                observer.complete();
            });
        }

        const headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
        return this.http.get<ITournament>(this.url + '/' + id, { headers: headers })
            .map((jsonTournament: ITournament) => {
                const tournamentRes = this.jsonToObjectHelper(jsonTournament);
                this.cache.push(tournamentRes);
                return tournamentRes;
            })
            .catch(this.handleError);
    }

    createObject(tournament: Tournament): Observable<Tournament> {
        console.log(this.objectToJsonHelper(tournament));
        return this.http
            .post(this.url, this.objectToJsonHelper(tournament), { headers: super.getHeaders() })
            // ...and calling .json() on the response to return data
            .map((res: ITournament) => {
                const tournamentIn = this.jsonToObjectHelper(res);
                this.cache.push(tournamentIn);
                return tournamentIn;
            })
            .catch(this.handleError);
    }

    editObject(tournament: Tournament): Observable<Tournament> {
        return this.http
            .put(this.url + '/' + tournament.getId(), this.objectToJsonHelper(tournament), { headers: super.getHeaders() })
            .map((res: ITournament) => {
                console.log(res); return this.jsonToObjectHelper(res);
            })
            .catch(this.handleError);
    }

    removeObject(tournament: Tournament): Observable<boolean> {
        const url = this.url + '/' + tournament.getId();
        return this.http
            .delete(url, { headers: super.getHeaders(), responseType: 'text' })
            .map((res) => {
                const index = this.cache.indexOf(tournament);
                if (index > -1) {
                    this.cache.splice(index, 1);
                }
                return true;
            })
            .catch(this.handleError);
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

/**
 * Created by coen on 1-10-17.
 */
import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';
import { Tournament } from '../tournament';
import { CompetitionseasonRepository } from 'voetbaljs/competitionseason/repository';
import { TournamentRoleRepository } from './role/repository';
import { VoetbalRepository } from 'voetbaljs/repository';
import { PACKAGE_ROOT_URL } from '@angular/core/src/application_tokens';

@Injectable()
export class TournamentRepository extends VoetbalRepository {

    private url: string;
    private csRepository: CompetitionseasonRepository;
    private tournamentRoleRepository: TournamentRoleRepository;
    private objects: Tournament[] = [];

    constructor(private http: HttpClient, csRepository: CompetitionseasonRepository, tournamentRoleRepository: TournamentRoleRepository) {
        super();
        this.csRepository = csRepository;
        this.tournamentRoleRepository = tournamentRoleRepository;
        this.url = super.getApiUrl() + this.getUrlpostfix();
    }

    getUrlpostfix(): string {
        return 'tournaments';
    }

    getObjects(): Observable<Tournament[]> {
        if (this.objects.length > 0) {
            return Observable.create((observer: Observer<Tournament[]>) => {
                observer.next(this.objects);
                observer.complete();
            });
        }

        // const date = new Date();
        // date.setDate(date.getDate() - 1);
        // const myParams = new URLSearchParams();
        // myParams.append('startdatetime', date.getTime());
        // date.setDate(date.getDate() + 8);
        // myParams.append('enddatetime', date.getTime());
        // const options = new RequestOptions( {
        //       headers: super.getHeaders(),
        //        params: myParams
        //    }
        // );
        //
        //         const observable = this.http.get<Tournament[]>(
        //             this.url,
        //             {
        //                 /*params: new HttpParams().set('id', '56784'),*/
        //                 headers: super.getHeaders()
        //             } );
        //
        //         observable.subscribe(res => {
        //             this.objects = this.jsonArrayToObject(res);
        //         });
        //         return observable;

        return this.http.get(this.url, { headers: super.getHeaders() })
            .map((res) => {
                this.objects = this.jsonArrayToObject(res);
                return this.objects;
            })
            .catch(this.handleError);
    }

    jsonArrayToObject(jsonArray: any): Tournament[] {
        const tournaments: Tournament[] = [];
        for (const json of jsonArray) {
            const object = this.jsonToObjectHelper(json);
            tournaments.push(object);
        }
        return tournaments;
    }

    getObject(id: number): Observable<Tournament> {
        return Observable.create((observer: Observer<Tournament>) => {
            this.getObjects().subscribe(
                /* happy path */ tournaments => {
                    const tournament = tournaments.find(
                        tournamentIt => tournamentIt.getId() === id
                    );
                    observer.next(tournament);
                    observer.complete();
                },
                /* error path */ e => { this.handleError(e); },
                /* onComplete */() => { }
            );
        });
    }

    jsonToObjectHelper(json: any): Tournament {
        const competitionseason = this.csRepository.jsonToObjectHelper(json.competitionseason);

        const tournament = new Tournament(competitionseason);
        const roles = this.tournamentRoleRepository.jsonArrayToObject(json.roles, tournament);
        tournament.setRoles(roles);
        tournament.setId(json.id);
        return tournament;
    }

    objectToJsonHelper(object: Tournament): any {
        return {
            'id': object.getId(),
            'competitionseason': this.csRepository.objectToJsonHelper(object.getCompetitionseason()),
            'roles': this.tournamentRoleRepository.objectsToJsonHelper(object.getRoles())
        };
    }

    createObject(tournament: Tournament): Observable<Tournament> {
        console.log(this.objectToJsonHelper(tournament));
        return this.http
            .post(this.url, this.objectToJsonHelper(tournament), { headers: super.getHeaders() })
            // ...and calling .json() on the response to return data
            .map((res) => {
                const tournamentIn = this.jsonToObjectHelper(res);
                this.objects.push(tournamentIn);
                return tournamentIn;
            })
            .catch(this.handleError);
    }

    editObject(tournament: Tournament): Observable<Tournament> {
        return this.http
            .put(this.url + '/' + tournament.getId(), this.objectToJsonHelper(tournament), { headers: super.getHeaders() })
            .map((res) => {
                console.log(res); return this.jsonToObjectHelper(res);
            })
            .catch(this.handleError);
    }

    removeObject(tournament: Tournament): Observable<boolean> {
        const url = this.url + '/' + tournament.getId();
        return this.http
            .delete(url, { headers: super.getHeaders(), responseType: 'text' })
            .map((res) => {
                const index = this.objects.indexOf(tournament);
                if (index > -1) {
                    this.objects.splice(index, 1);
                }
                return true;
            })
            .catch(this.handleError);
    }

    // this could also be a private method of the component class
    handleError(res: Response): Observable<any> {
        let errortext = res.statusText;
        if (res.status === 401) {
            errortext = 'je bent niet ingelogd';
        }
        console.error(res);
        // throw an application level error
        return Observable.throw(errortext);
    }
}

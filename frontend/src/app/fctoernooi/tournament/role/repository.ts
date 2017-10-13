/**
 * Created by coen on 10-10-17.
 */
import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Tournament } from '../../tournament';
import { TournamentRole } from '../role';
import { UserRepository } from '../../../user/repository';
import { VoetbalRepository } from 'voetbaljs/repository';

@Injectable()
export class TournamentRoleRepository extends VoetbalRepository {

    private url: string;
    private http: Http;
    private userRepos: UserRepository;
    private objects: Tournament[];

    constructor( http: Http, userRepos: UserRepository ) {
        super();
        this.http = http;
        this.userRepos = userRepos;
        this.url = super.getApiUrl() + this.getUrlpostfix();
    }

    getUrlpostfix(): string {
        return 'tournamentroles';
    }

    // getObjects(): Observable<Tournament[]>
    // {
    //     if ( this.objects != null ){
    //         return Observable.create(observer => {
    //             observer.next(this.objects);
    //             observer.complete();
    //         });
    //     }
    //
    //     return this.http.get(this.url, new RequestOptions({ headers: this.getHeaders() }) )
    //         .map((res) => {
    //             const objects = this.jsonArrayToObject(res.json());
    //             this.objects = objects;
    //             return this.objects;
    //         })
    //         .catch( this.handleError );
    // }

    jsonArrayToObject( jsonArray: any, tournament: Tournament ): TournamentRole[] {
        const tournamentRoles: TournamentRole[] = [];
        for (const json of jsonArray) {
            const object = this.jsonToObjectHelper(json, tournament);
            tournamentRoles.push( object );
        }
        return tournamentRoles;
    }

    // getObject( competitionSeason: CompetitionSeason): Observable<Tournament>
    // {
    //     let observable = Observable.create(observer => {
    //         this.getObjects().subscribe(
    //             /* happy path */ tournaments => {
    //                 const tournament = tournaments.find(
    //                     tournamentIt => tournamentIt.getCompetitionseason().getId() === competitionSeason.getId()
    //                 );
    //                 observer.next(tournament);
    //                 observer.complete();
    //             },
    //             /* error path */ e => { this.handleError(e) },
    //             /* onComplete */ () => { }
    //         );
    //     });
    //     return observable;
    // }
    //
    jsonToObjectHelper( json: any, tournament: Tournament ): TournamentRole {
        const user = this.userRepos.jsonToObjectHelper(json.user);

        const tournamentRole = new TournamentRole(tournament, user, json.role);
        tournamentRole.setId( json.id );
        return tournamentRole;
    }

    objectsToJsonHelper( objects: any[] ): any[] {
        const jsonArray: any[] = [];
        for (const object of objects) {
            const json = this.objectToJsonHelper(object);
            jsonArray.push( json );
        }
        return jsonArray;
    }

    objectToJsonHelper( object: TournamentRole ): any {
        const json = {
            // 'tournament': this.tournamentRepository.objectToJsonHelper(object.getTournament()),
            'user': this.userRepos.objectToJsonHelper(object.getUser()),
            'role': object.getRole()
        };
        return json;
    }
    //
    // createObject( jsonObject: any ): Observable<Tournament> {
    //     return this.http
    //         .post(this.url, jsonObject, new RequestOptions({ headers: this.getHeaders() }))
    //         // ...and calling .json() on the response to return data
    //         .map((res) => /*this.jsonToObjectHelper(res.json())*/console.log(res.json()) )
    //         .catch(this.handleError);
    // }
    //
    // editObject( object: CompetitionSeason ): Observable<CompetitionSeason>
    // {
    //     let url = this.url + '/'+object.getId();
    //
    //     return this.http
    //         .put(url, JSON.stringify( object ), { headers: this.getHeaders() })
    //         // ...and calling .json() on the response to return data
    //         .map((res) => { console.log(res.json()); return this.jsonToObjectHelper(res.json()); })
    //         //...errors if any
    //         .catch(this.handleError);
    // }
    //
    // removeObject( object: CompetitionSeason): Observable<void>
    // {
    //     let url = this.url + '/'+object.getId();
    //     return this.http
    //         .delete(url, new RequestOptions({ headers: this.getHeaders() }))
    //         // ...and calling .json() on the response to return data
    //         .map((res:Response) => res)
    //         //...errors if any
    //         .catch(this.handleError);
    // }

    // this could also be a private method of the component class
    handleError(res: Response): Observable<any> {
        console.error( res );
        // throw an application level error
        return Observable.throw( res.statusText );
    }
}
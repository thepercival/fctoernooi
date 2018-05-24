import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SportRepository } from 'ngx-sport';

import { IUser, UserRepository } from '../../../user/repository';
import { Tournament } from '../../tournament';
import { TournamentRole } from '../role';

/**
 * Created by coen on 10-10-17.
 */
@Injectable()
export class TournamentRoleRepository extends SportRepository {

    private url: string;
    private userRepos: UserRepository;
    private objects: Tournament[];

    constructor(private http: HttpClient, userRepos: UserRepository, router: Router) {
        super(router);
        this.userRepos = userRepos;
        this.url = super.getApiUrl() + this.getUrlpostfix();
    }

    getUrlpostfix(): string {
        return 'roles';
    }

    // getObjects(): Observable<Tournament[]>
    // {
    //     if ( this.objects !== undefined ){
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

    jsonArrayToObject(jsonArray: ITournamentRole[], tournament: Tournament): TournamentRole[] {
        const tournamentRoles: TournamentRole[] = [];
        for (const json of jsonArray) {
            tournamentRoles.push(this.jsonToObjectHelper(json, tournament));
        }
        return tournamentRoles;
    }

    // getObject( competition: Competition): Observable<Tournament>
    // {
    //     let observable = Observable.create(observer => {
    //         this.getObjects().subscribe(
    //             /* happy path */ tournaments => {
    //                 const tournament = tournaments.find(
    //                     tournamentIt => tournamentIt.getCompetition().getId() === competition.getId()
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
    jsonToObjectHelper(json: ITournamentRole, tournament: Tournament): TournamentRole {
        const user = this.userRepos.jsonToObjectHelper(json.user);

        const tournamentRole = new TournamentRole(tournament, user, json.value);
        tournamentRole.setId(json.id);
        return tournamentRole;
    }

    objectsToJsonArray(roles: TournamentRole[]): any[] {
        const jsonArray: ITournamentRole[] = [];
        for (const role of roles) {
            jsonArray.push(this.objectToJsonHelper(role));
        }
        return jsonArray;
    }

    objectToJsonHelper(role: TournamentRole): any {
        const json: ITournamentRole = {
            id: role.getId(),
            user: this.userRepos.objectToJsonHelper(role.getUser()),
            value: role.getValue()
        };
        return json;
    }
    //
    // createObject( jsonObject: any ): Observable<Tournament> {
    //     return this.http
    //         .post(this.url, jsonObject, new RequestOptions({ headers: this.getHeaders() }))
    //         // ...and calling .json() on the response to return data
    //         .map((res) => /*this.jsonToObjectHelper(res.json())*/ )
    //         .catch(this.handleError);
    // }
    //
    // editObject( object: Competition ): Observable<Competition>
    // {
    //     let url = this.url + '/'+object.getId();
    //
    //     return this.http
    //         .put(url, JSON.stringify( object ), { headers: this.getHeaders() })
    //         // ...and calling .json() on the response to return data
    //         .map((res) => { return this.jsonToObjectHelper(res.json()); })
    //         //...errors if any
    //         .catch(this.handleError);
    // }
    //
    // removeObject( object: Competition): Observable<void>
    // {
    //     let url = this.url + '/'+object.getId();
    //     return this.http
    //         .delete(url, new RequestOptions({ headers: this.getHeaders() }))
    //         // ...and calling .json() on the response to return data
    //         .map((res:Response) => res)
    //         //...errors if any
    //         .catch(this.handleError);
    // }
}

export interface ITournamentRole {
    id?: number;
    user: IUser;
    value: number;
}

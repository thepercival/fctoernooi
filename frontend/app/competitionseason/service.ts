import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';
import {Observable} from 'rxjs/Rx';
import { AuthenticationService } from '../auth/service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { CompetitionSeason } from '../voetbal/competitionseason';
import { VoetbalServiceInterface } from '../voetbal/service.interface';

@Injectable()
export class CompetitionSeasonService implements VoetbalServiceInterface {

    private headers = new Headers({'Content-Type': 'application/json'});
    private competitionseasonsUrl = 'http://localhost:2999/competitionseasons';  // localhost:2999/competitionseasons

    constructor(private http: Http, private authService: AuthenticationService ) { }

    // interface
    getObjects(): Observable<CompetitionSeason[]> {
        return this.http.get(this.competitionseasonsUrl, {headers: this.headers} )
        // ...and calling .json() on the response to return data
            .map((res:Response) => res.json())
            //...errors if any
            .catch((error:any) => Observable.throw(error.message || 'Server error' ));
    }

    getObject( id: number ): Observable<CompetitionSeason> {
        // var x = this.getCompetitionSeasons().forEach(competitionseasons => competitionseasons.find(competitionseason => competitionseason.id === id));
        const url = `${this.competitionseasonsUrl}/${id}`;
        return this.http.get(url)
        // ...and calling .json() on the response to return data
            .map((res:Response) => res.json())
            //...errors if any
            .catch((error:any) => Observable.throw(error.message || 'Server error' ));
    }

    createObject( object: CompetitionSeason ): Observable<CompetitionSeason> {

        let name: string = object.name;
        let seasonname: string = object.seasonname;
        // let nrofteams: number = object.nrofteams;
        let userid =  this.authService.userid;

        return this.http
            .post(this.competitionseasonsUrl, JSON.stringify({name: name, seasonname: seasonname, structure: '{}', userid: userid}), {headers: this.headers})
            // ...and calling .json() on the response to return data
            .map((res:Response) => res.json())
            //...errors if any
            .catch((error:any) => Observable.throw(error.message || 'Server error'));
    }

    updateObject( object: CompetitionSeason): Observable<CompetitionSeason> {

        const url = `${this.competitionseasonsUrl}/${object.id}`;
        return this.http
            .put(url, JSON.stringify(object), {headers: this.headers})
            // ...and calling .json() on the response to return data
            .map((res:Response) => res.json())
            //...errors if any
            .catch((error:any) => Observable.throw(error.message || 'Server error'));
    }


    deleteObject(id: number): Observable<void> {
        const url = `${this.competitionseasonsUrl}/${id}`;
        return this.http
            .delete(url, {headers: this.headers})
            // ...and calling .json() on the response to return data
            .map((res:Response) => res.json())
            //...errors if any
            .catch((error:any) => Observable.throw(error.message || 'Server error'));
    }

    /*private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }*/
}

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
        return this.getCompetitionSeasons();
    }

    getObject( id: number ): Observable<CompetitionSeason> {
        return this.getCompetitionSeason(12);
    }

    getCompetitionSeasons(): Observable<CompetitionSeason[]> {
        return this.http.get(this.competitionseasonsUrl, {headers: this.headers} )
            // ...and calling .json() on the response to return data
            .map((res:Response) => res.json())
            //...errors if any
            .catch((error:any) => Observable.throw(error.message || 'Server error' ));

    }

    /*getCompetitionSeasonsSlow(): Observable<CompetitionSeason[]> {

        setTimeout( () => {
            this.getCompetitionSeasons()
        });
        var source = new Observable<CompetitionSeason[]>(resolve =>
            setTimeout(resolve, 2000)) // delay 2 seconds
            .then(() => );
        source.forEach( x => );
    }*/

    getCompetitionSeason(id: number): Observable<CompetitionSeason> {
        // var x = this.getCompetitionSeasons().forEach(competitionseasons => competitionseasons.find(competitionseason => competitionseason.id === id));
        const url = `${this.competitionseasonsUrl}/${id}`;
        return this.http.get(url)
        // ...and calling .json() on the response to return data
            .map((res:Response) => res.json())
            //...errors if any
            .catch((error:any) => Observable.throw(error.message || 'Server error' ));
    }

    createObject( properties: {} ): Observable<CompetitionSeason> {

        let name: string = 'test';
        let seasonName: string = 'testsn';
        let nrofteams: number = 12;

        let userid =  this.authService.userid;

        return this.http
            .post(this.competitionseasonsUrl, JSON.stringify({name: name, seasonName: seasonName, structure: '{}', userid: userid}), {headers: this.headers})
            // ...and calling .json() on the response to return data
            .map((res:Response) => res.json())
            //...errors if any
            .catch((error:any) => Observable.throw(error.message || 'Server error'));
    }

    update(competitionseason: CompetitionSeason): Observable<CompetitionSeason> {

        const url = `${this.competitionseasonsUrl}/${competitionseason.id}`;
        return this.http
            .put(url, JSON.stringify(competitionseason), {headers: this.headers})
            // ...and calling .json() on the response to return data
            .map((res:Response) => res.json())
            //...errors if any
            .catch((error:any) => Observable.throw(error.message || 'Server error'));
    }

    delete(id: number): Observable<void> {
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

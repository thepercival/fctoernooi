/**
 * Created by coen on 1-10-17.
 */
import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
// import { CompetitionSeason } from '../competitionseason';
// import { AssociationRepository } from '../association/repository';
// import { CompetitionRepository } from '../competition/repository';
// import { SeasonRepository } from '../season/repository';

@Injectable()
export class TournamentRepository {

    private url : string;
    private http: Http;
    // private objects: CompetitionSeason[];

    constructor( http: Http//,
                 // private associationRepository: AssociationRepository,
                 // private competitionRepository: CompetitionRepository,
                 // private seasonRepository: SeasonRepository
    )
    {
        // this.http = http;
        // this.url = "http://localhost:2999/voetbal/" + this.getUrlpostfix();
    }

    // getUrlpostfix(): string
    // {
    //     return 'competitionseasons';
    // }
    //
    // getToken(): string
    // {
    //     let user = JSON.parse( localStorage.getItem('user') );
    //     if ( user != null && user.token != null ) {
    //         return user.token;
    //     }
    //     return null;
    // }
    //
    // getHeaders(): Headers
    // {
    //     let headers = new Headers({'Content-Type': 'application/json; charset=utf-8'});
    //     if ( this.getToken() != null ) {
    //         headers.append( 'Authorization', 'Bearer ' + this.getToken() );
    //     }
    //     return headers;
    // }
    //
    // getObjects(): Observable<CompetitionSeason[]>
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
    //             let objects = this.jsonArrayToObject(res.json());
    //             this.objects = objects;
    //             return this.objects;
    //         })
    //         .catch( this.handleError );
    // }
    //
    // jsonArrayToObject( jsonArray : any ): CompetitionSeason[]
    // {
    //     let competitionseasons: CompetitionSeason[] = [];
    //     for (let json of jsonArray) {
    //         let object = this.jsonToObjectHelper(json);
    //         competitionseasons.push( object );
    //     }
    //     return competitionseasons;
    // }
    //
    // getObject( id: number): Observable<CompetitionSeason>
    // {
    //     console.log('id',id);
    //     let observable = Observable.create(observer => {
    //         this.getObjects().subscribe(
    //             /* happy path */ competitionseasons => {
    //                 let competitionseason = competitionseasons.filter(
    //                     competitionseasonsIt => competitionseasonsIt.getId() == id
    //                 ).shift();
    //                 observer.next(competitionseason);
    //                 observer.complete();
    //             },
    //             /* error path */ e => { this.handleError(e) },
    //             /* onComplete */ () => { }
    //         );
    //     });
    //     return observable;
    // }
    //
    // jsonToObjectHelper( json : any ): CompetitionSeason
    // {
    //     if ( this.objects != null ){
    //         let foundObjects = this.objects.filter(
    //             objectIt => objectIt.getId() == json.id
    //         );
    //         if ( foundObjects.length == 1) {
    //             return foundObjects.shift();
    //         }
    //     }
    //
    //     let association = this.associationRepository.jsonToObjectHelper(json.association);
    //     let competition = this.competitionRepository.jsonToObjectHelper(json.competition);
    //     let season = this.seasonRepository.jsonToObjectHelper(json.season);
    //
    //     let competitionseason = new CompetitionSeason(association, competition, season);
    //     competitionseason.setId(json.id);
    //     competitionseason.setState(json.state);
    //     competitionseason.setQualificationrule(json.qualificationrule);
    //     competitionseason.setHasStructure(json.hasstructure);
    //     return competitionseason;
    // }
    //
    // objectToJsonHelper( object : CompetitionSeason ): any
    // {
    //     let json = {
    //         "id":object.getId(),
    //         "state":object.getState(),
    //         "qualificationrule":object.getQualificationrule(),
    //         "association":this.associationRepository.objectToJsonHelper(object.getAssociation()),
    //         "competition":this.competitionRepository.objectToJsonHelper(object.getCompetition()),
    //         "season":this.seasonRepository.objectToJsonHelper(object.getSeason())
    //     };
    //     return json;
    // }
    //
    // createObject( jsonObject: any ): Observable<CompetitionSeason>
    // {
    //     return this.http
    //         .post(this.url, jsonObject, new RequestOptions({ headers: this.getHeaders() }))
    //         // ...and calling .json() on the response to return data
    //         .map((res) => this.jsonToObjectHelper(res.json()))
    //         //...errors if any
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
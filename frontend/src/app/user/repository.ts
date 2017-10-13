import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';
import { Observable, Observer } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { User } from './user';
import { VoetbalRepository } from 'voetbaljs/repository';

@Injectable()
export class UserRepository extends VoetbalRepository {

  private http: Http;
  private url: string;

  constructor( http: Http ) {
    super();
    this.http = http;
    this.url = super.getApiUrl() + this.getUrlpostfix();
  }

  getUrlpostfix(): string {
    return 'users';
  }

  getObjects(): Observable<User[]> {
    // const date = new Date();
    // date.setDate(date.getDate() - 1);
    const myParams = new URLSearchParams();
    // myParams.append('startdatetime', date.getTime());
    // date.setDate(date.getDate() + 8);
    // myParams.append('enddatetime', date.getTime());
    const options = new RequestOptions( {
          headers: super.getHeaders(),
          params: myParams
        }
    );
    return this.http.get(this.url, options )
        .map((res) => {
          // console.log(res.json());
          return this.jsonArrayToObject(res.json());
        })
        .catch( this.handleError );
  }

  jsonArrayToObject( jsonArray: any ): User[] {
    const users: User[] = [];
    for (const json of jsonArray) {
      const object = this.jsonToObjectHelper(json);
      users.push( object );
    }
    return users;
  }

  getObject( id: number): Observable<User> {
      const url = `${this.url}/${id}`;
      return this.http.get(url)
          // ...and calling .json() on the response to return data
          .map((res: Response) => this.jsonToObjectHelper(res.json() ) )
          // ...errors if any
          .catch(this.handleError);
  }

  jsonToObjectHelper( json: any ): User {
    const user = new User( json.emailaddress );
    user.setId( json.id );
    user.setName( json.name );
    return user;
  }

  createObject( jsonObject: any ): Observable<User> {
    return this.http
        .post(this.url, jsonObject, new RequestOptions({ headers: super.getHeaders() }))
        // ...and calling .json() on the response to return data
        .map((res) => this.jsonToObjectHelper(res.json()) )
        .catch(this.handleError);
  }

  objectToJsonHelper( user: User ): any {
    const json = {
      'id': user.getId(),
      'name': user.getName(),
      'emailaddress': user.getEmailaddress()
    };
    return json;
  }

  // this could also be a private method of the component class
  handleError(error: any): Observable<any> {
    console.error( error.statusText );
    // throw an application level error
    return Observable.throw( error.statusText );
  }

}

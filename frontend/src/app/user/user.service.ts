import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { environment } from '../../environments/environment';
import { User } from './user';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UserService {

  private headers = new Headers({'Content-Type': 'application/json'});
  private url: string;

  constructor(
      private http: Http,
      private authService: AuthService
  ) {
      console.log('apiurl', environment.apiurl);
      this.url = environment.apiurl + 'users';
  }

  getUsers(): Observable<User[]> {
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.authService.token, 'Content-Type': 'application/json' });
    // let options = new RequestOptions({ headers: headers });
    const options = new RequestOptions({ headers: headers });
    return this.http.get(this.url, options)
    // ...and calling .json() on the response to return data
        .map((res: Response) => res.json())
        // ...errors if any
        .catch( this.handleError );
  }



  getUser(id: number): Observable<User> {
    // var x = this.getUsers().forEach(users => users.find(user => user.id === id));
    const url = `${this.url}/${id}`;
    return this.http.get(url)
    // ...and calling .json() on the response to return data
        .map((res: Response) => res.json())
        // ...errors if any
        .catch(this.handleError);
  }

  create( newUser: User ): Observable<User> {
    return this.http
        .post(this.url, JSON.stringify( newUser ), {headers: this.headers})
        // ...and calling .json() on the response to return data
        .map((res: Response) => res.json())
        // ...errors if any
        .catch(this.handleError);
  }

  jsonToObjectHelper( json: any ): User
  {
    const user = new User();
    user.id = json.id;
    user.name = json.name;
    return user;
  }

  objectToJsonHelper( user: User ): any {
    const json = {
      'id': user.id,
      'name': user.name
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

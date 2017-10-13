import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { UserRepository } from '../user/repository';
import { User } from '../user/user';

@Injectable()
export class AuthService {

  private token: string;
  private userId: number;
  private url: string;
  private headers = new Headers({'Content-Type': 'application/json'});

  constructor( private http: Http, private router: Router, private userRepos: UserRepository) {
    this.url = environment.apiurl + 'auth/';
    const jsonAuth = JSON.parse(localStorage.getItem('auth'));
    this.token = jsonAuth ? jsonAuth.token : null;
    this.userId = jsonAuth ? jsonAuth.userid : null;
  }

  isLoggedIn(): boolean {
    return this.token !== null;
  }

  getLoggedInUserId(): number {
    return this.userId;
  }

  // register( newUser: User ): Observable<User> {
  //   return this.http
  //       .post(this.url + 'register', JSON.stringify( newUser ), {headers: this.headers})
  //       // ...and calling .json() on the response to return data
  //       .map((res:Response) => res.json())
  //       //...errors if any
  //       .catch(this.handleError);
  // }

  // activate( email: string, activationkey : string ): Observable<boolean> {
  //   return this.http.post( this.url + 'activate', { email: email, activationkey: activationkey })
  //       .map((response: Response) => response.text() )
  //       .catch(this.handleError);
  // }

  login(emailaddress: string, password: string): Observable<boolean> {
    return this.http.post( this.url + 'login', { emailaddress: emailaddress, password: password })
        .map((response: Response) => {
          const json = response.json();
          // login successful if there's a jwt token in the response
          if (json && json.token && json.userid ) {
            this.token = json.token;
            this.userId = json.userid;
            localStorage.setItem('auth', JSON.stringify({ userid: this.userId, token: json.token }));
            return true;
          } else {
            return false;
          }
        })
        .catch(this.handleError);
    // .catch((error:any) => Observable.throw( error.statusText || 'Server error' ) );
    /*.catch((err:any) => {
     //console.log( err.statusText );
     Observable.throw( err.statusText )
     });*/
  }

  // passwordReset( email: string ): Observable<boolean> {
  //   return this.http.post( this.url + 'passwordreset', { email: email })
  //       .map((response: Response) => {
  //         let retVal = response.text()
  //         // console.log( retVal );
  //         return retVal;
  //       } )
  //       .catch(this.handleError);
  // }
  //
  // passwordChange( email: string, password: string, key: string ): Observable<boolean> {
  //   return this.http.post( this.url + 'passwordchange', { email: email, password: password, key: key })
  //       .map((response: Response) => {
  //         let retVal = response.text();
  //         // console.log( retVal );
  //         return retVal;
  //       } )
  //       .catch(this.handleError);
  // }

  logout(): void {
    // clear token remove user from local storage to log user out
    this.token = null;
    this.userId = null;
    localStorage.removeItem('auth');
  }

  // this could also be a private method of the component class
  handleError(error: Response): Observable<any> {
    console.error( error.statusText );
    // throw an application level error
    return Observable.throw( error.statusText );
  }

}

import 'rxjs/add/operator/map';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';

import { environment } from '../../environments/environment';
import { UserRepository } from '../user/repository';

@Injectable()
export class AuthService {

  private token: string;
  private userId: number;
  private url: string;

  constructor(private http: HttpClient, private router: Router, private userRepos: UserRepository) {
    this.url = environment.apiurl + 'auth/';
    const jsonAuth = JSON.parse(localStorage.getItem('auth'));
    this.token = jsonAuth ? jsonAuth.token : undefined;
    this.userId = jsonAuth ? jsonAuth.userid : undefined;
  }

  isLoggedIn(): boolean {
    return this.token !== undefined;
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
    return this.http.post<IAuthItem>(this.url + 'login', { emailaddress: emailaddress, password: password })
      .map((res) => {
        const json = res;
        // login successful if there's a jwt token in the response
        if (json && json.token && json.userid) {
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
    this.token = undefined;
    this.userId = undefined;
    localStorage.removeItem('auth');
  }

  // this could also be a private method of the component class
  handleError(error): Observable<any> {
    console.error(error.statusText);
    // throw an application level error
    return Observable.throw(error.statusText);
  }
}

interface IAuthItem {
  token: string;
  userid: number;
}
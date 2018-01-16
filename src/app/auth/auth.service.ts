import { SportRepository } from 'ngx-sport';
import { User } from '../user/user';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators/map';
import { catchError } from 'rxjs/operators/catchError';
import 'rxjs/add/observable/throw';

import { environment } from '../../environments/environment';
import { IUser, UserRepository } from '../user/repository';

@Injectable()
export class AuthService extends SportRepository {

  private authItem: IAuthItem;
  private url: string;

  constructor(private http: HttpClient, private router: Router, private userRepos: UserRepository) {
    super();
    const jsonAuth = JSON.parse(localStorage.getItem('auth'));
    this.authItem = {
      token: jsonAuth ? jsonAuth.token : undefined,
      userid: jsonAuth ? jsonAuth.userid : undefined
    };
    this.url = super.getApiUrl() + this.getUrlpostfix();
  }

  getUrlpostfix(): string {
      return 'auth';
  }

  isLoggedIn(): boolean {
    return this.authItem !== undefined && this.authItem.token !== undefined;
  }

  getLoggedInUserId(): number {
    return this.authItem.userid;
  }

  register( newUser: any ): Observable<User> {
    return this.http.post(this.url + '/register', newUser, {headers: super.getHeaders()}).pipe(
      map((res: any) => {
        const authItem: IAuthItem = { token: res.token, userid: res.user.id };
        this.setAuthItem( authItem);
        const user = this.userRepos.jsonToObjectHelper(res.user);
        return user;
      }),
      catchError(this.handleError)
    );
  }

  // activate( email: string, activationkey : string ): Observable<boolean> {
  //   return this.http.post( this.url + '/activate', { email: email, activationkey: activationkey })
  //       .map((response: Response) => response.text() )
  //       .catch(this.handleError);
  // }

  login(emailaddress: string, password: string): Observable<boolean> {
    return this.http.post<IAuthItem>(this.url + '/login', { emailaddress: emailaddress, password: password }).pipe(
      map((res) => {
        if (res && res.token && res.userid) {
          const authItem: IAuthItem = { token: res.token, userid: res.userid };
          return this.setAuthItem( authItem);
        } else {
          return false;
        }
      }),
      catchError( this.handleError )
    );
  }

  setAuthItem(authItem: IAuthItem): boolean {
    this.authItem = authItem;
    localStorage.setItem('auth', JSON.stringify(authItem));
    return true;
  }

  // passwordReset( email: string ): Observable<boolean> {
  //   return this.http.post( this.url + '/passwordreset', { email: email })
  //       .map((response: Response) => {
  //         let retVal = response.text()
  //         // console.log( retVal );
  //         return retVal;
  //       } )
  //       .catch(this.handleError);
  // }
  //
  // passwordChange( email: string, password: string, key: string ): Observable<boolean> {
  //   return this.http.post( this.url + '/passwordchange', { email: email, password: password, key: key })
  //       .map((response: Response) => {
  //         let retVal = response.text();
  //         // console.log( retVal );
  //         return retVal;
  //       } )
  //       .catch(this.handleError);
  // }

  logout(): void {
    // clear token remove user from local storage to log user out
    this.authItem = undefined;
    localStorage.removeItem('auth');
  }

  handleError(error: HttpErrorResponse): Observable<any> {
    let errortext = 'onbekende fout';
    console.error(error);
    if (typeof error.error === 'string') {
        errortext = error.error;
    }
    if (error.status === 401) {
        errortext = 'je bent niet ingelogd';
    }
    return Observable.throw(errortext);
  }
}

interface IAuthItem {
  token: string;
  userid: number;
}

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { APIRepository } from 'ngx-sport';
import { Observable, throwError as observableThrowError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { User } from '../lib/user';
import { UserMapper } from '../lib/user/mapper';


@Injectable()
export class AuthService extends APIRepository {

  private authItem: IAuthItem;
  private url: string;

  constructor(private http: HttpClient, router: Router, private userMapper: UserMapper) {
    super(router);
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
    return this.authItem ? this.authItem.userid : undefined;
  }

  register(newUser: any): Observable<User> {
    return this.http.post(this.url + '/register', newUser, { headers: super.getHeaders() }).pipe(
      map((res: any) => {
        const authItem: IAuthItem = { token: res.token, userid: res.user.id };
        this.setAuthItem(authItem);
        return this.userMapper.toObject(res.user);
      }),
      catchError((err) => this.handleError(err))
    );
  }

  validateToken(): Observable<boolean> {
    return this.http.post(this.url + '/validatetoken', undefined, { headers: super.getHeaders() }).pipe(
      map((res) => true),
      catchError((err) => observableThrowError(err))
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
          return this.setAuthItem(authItem);
        } else {
          return false;
        }
      }),
      catchError((err) => this.handleError(err))
    );
  }

  setAuthItem(authItem: IAuthItem): boolean {
    this.authItem = authItem;
    localStorage.setItem('auth', JSON.stringify(authItem));
    return true;
  }

  passwordReset(email: string): Observable<boolean> {
    return this.http.post(this.url + '/passwordreset', { emailaddress: email }).pipe(
      map((res: any) => {
        return res.retval;
      }),
      catchError((err) => this.handleError(err))
    );
  }

  passwordChange(emailaddress: string, password: string, code: string): Observable<boolean> {
    return this.http.post(this.url + '/passwordchange', { emailaddress: emailaddress, password: password, code: code }).pipe(
      map((res: any) => {
        if (res && res.token && res.userid) {
          const authItem: IAuthItem = { token: res.token, userid: res.userid };
          return this.setAuthItem(authItem);
        } else {
          return false;
        }
      }),
      catchError((err) => this.handleError(err))
    );
  }

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
    } else if (error.statusText !== undefined) {
      errortext = error.statusText;
    }
    if (error.status === 401) {
      this.router.navigate(['/user/login']);
    }
    return observableThrowError(errortext);
  }
}

interface IAuthItem {
  token: string;
  userid: number;
}

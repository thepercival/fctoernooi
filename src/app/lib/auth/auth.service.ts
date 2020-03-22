import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError as observableThrowError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { User } from '../user';
import { UserMapper } from '../user/mapper';
import { APIRepository } from '../repository';

@Injectable()
export class AuthService extends APIRepository {

  private authItem: IAuthItem;

  constructor(private http: HttpClient, private userMapper: UserMapper) {
    super();
    const jsonAuth = JSON.parse(localStorage.getItem('auth'));
    this.authItem = {
      token: jsonAuth ? jsonAuth.token : undefined,
      userid: jsonAuth ? jsonAuth.userid : undefined
    };
  }

  isLoggedIn(): boolean {
    return this.authItem !== undefined && this.authItem.token !== undefined;
  }

  getLoggedInUserId(): number {
    return this.authItem ? this.authItem.userid : undefined;
  }

  getUrl(): string {
    return super.getApiUrl() + 'auth';
  }
  getPublicUrl(): string {
    return super.getApiUrl() + 'public/auth';
  }


  register(newUser: any): Observable<User> {
    return this.http.post(this.getPublicUrl() + '/register', newUser, { headers: super.getHeaders() }).pipe(
      map((res: any) => {
        const authItem: IAuthItem = { token: res.token, userid: res.user.id };
        this.setAuthItem(authItem);
        return this.userMapper.toObject(res.user);
      }),
      catchError((err) => this.handleError(err))
    );
  }

  validateToken(): Observable<boolean> {
    return this.http.post(this.getUrl() + '/validatetoken', undefined, { headers: super.getHeaders() }).pipe(
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
    return this.http.post<IAuthItem>(this.getPublicUrl() + '/login', { emailaddress: emailaddress, password: password }).pipe(
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
    return this.http.post(this.getPublicUrl() + '/passwordreset', { emailaddress: email }).pipe(
      map((res: any) => {
        return res.retval;
      }),
      catchError((err) => this.handleError(err))
    );
  }

  passwordChange(emailaddress: string, password: string, code: string): Observable<boolean> {
    return this.http.post(this.getPublicUrl() + '/passwordchange', { emailaddress: emailaddress, password: password, code: code }).pipe(
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
    return observableThrowError(errortext);
  }
}

interface IAuthItem {
  token: string;
  userid: number;
}

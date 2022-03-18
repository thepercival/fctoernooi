import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../repository';
import { JsonUser, UserMapper } from '../user/mapper';
import { User, UserId } from '../user';
@Injectable({
  providedIn: 'root'
})
export class AuthService extends APIRepository {
  // private userId: UserId | undefined;
  private authItem: JsonAuthItem | undefined;

  constructor(private userMapper: UserMapper, private http: HttpClient) {
    super();
    const authStorageItem = localStorage.getItem('auth');
    const authItem = authStorageItem ? JSON.parse(authStorageItem) : undefined;
    authItem ? this.setAuthItem(authItem) : this.clearAuthItem();
  }

  isLoggedIn(): boolean {
    return this.authItem !== undefined;
  }

  getLoggedInUserId(): UserId | undefined {
    return this.authItem ? new UserId(this.authItem.userId) : undefined;
  }

  protected clearAuthItem() {
    this.authItem = undefined;
    localStorage.removeItem('auth');
  }

  setAuthItem(authItem: JsonAuthItem): boolean {
    this.authItem = authItem;
    localStorage.setItem('auth', JSON.stringify(authItem));
    return true;
  }

  getUrl(): string {
    return super.getApiUrl() + 'auth';
  }

  getPublicUrl(): string {
    return super.getApiUrl() + 'public/auth';
  }

  register(newUser: any): Observable<boolean> {
    return this.http.post<JsonAuthItem>(this.getPublicUrl() + '/register', newUser, { headers: super.getHeaders() }).pipe(
      map((authItem: JsonAuthItem) => this.setAuthItem(authItem)),
      catchError((err: HttpErrorResponse) => this.handleError(err))
    );
  }

  extendToken() {
    this.http.post<JsonAuthItem>(this.getUrl() + '/extendtoken', undefined, { headers: super.getHeaders() }).pipe(
      map((authItem: JsonAuthItem) => this.setAuthItem(authItem)),
      catchError((err: HttpErrorResponse) => this.handleError(err))
    ).subscribe();
  }

  // activate( email: string, activationkey : string ): Observable<boolean> {
  //   return this.http.post( this.url + '/activate', { email: email, activationkey: activationkey })
  //       .map((response: Response) => response.text() )
  //       .catch(this.handleError);
  // }

  login(emailaddress: string, password: string): Observable<boolean> {
    const json = { emailaddress: emailaddress, password: password };
    return this.http.post<JsonAuthItem>(this.getPublicUrl() + '/login', json, this.getOptions()).pipe(
      map((authItem: JsonAuthItem) => this.setAuthItem(authItem)),
      catchError((err: HttpErrorResponse) => this.handleError(err))
    );
  }

  passwordReset(email: string): Observable<boolean> {
    const json = { emailaddress: email };
    return this.http.post(this.getPublicUrl() + '/passwordreset', json, this.getOptions()).pipe(
      map((res: any) => {
        return res.retval;
      }),
      catchError((err: HttpErrorResponse) => this.handleError(err))
    );
  }

  passwordChange(emailaddress: string, password: string, code: string): Observable<boolean> {
    const json = { emailaddress: emailaddress, password: password, code: code };
    return this.http.post<JsonAuthItem>(this.getPublicUrl() + '/passwordchange', json, this.getOptions()).pipe(
      map((authItem: JsonAuthItem) => this.setAuthItem(authItem)),
      catchError((err: HttpErrorResponse) => this.handleError(err))
    );
  }

  validationRequest(): Observable<void> {
    return this.http.post<JsonAuthItem>(this.getUrl() + '/validationrequest', undefined, this.getOptions()).pipe(
      catchError((err: HttpErrorResponse) => this.handleError(err))
    );
  }

  validate(code: string): Observable<User> {
    const url = this.getUrl() + '/validate/' + code;
    return this.http.post<JsonUser>(url, undefined, this.getOptions()).pipe(
      map((jsonUser: JsonUser) => this.userMapper.toObject(jsonUser)),
      catchError((err: HttpErrorResponse) => this.handleError(err))
    );
  }

  logout(): void {
    this.clearAuthItem();
  }
}

interface JsonAuthItem {
  token: string;
  userId: number;
}

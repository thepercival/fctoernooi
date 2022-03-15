import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../repository';
import { UserMapper } from '../user/mapper';
import { User } from '../user';

@Injectable()
export class AuthService extends APIRepository {
  private user: User | undefined;
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

  getUser(): User | undefined {
    return this.user;
  }

  protected clearAuthItem() {
    this.authItem = undefined;
    this.user = undefined;
    localStorage.removeItem('auth');
  }

  setAuthItem(authItem: JsonAuthItem): boolean {
    this.authItem = authItem;
    this.user = this.userMapper.toObject({ id: this.authItem.userId });
    localStorage.setItem('auth', JSON.stringify(authItem));
    return true;
  }

  // op adminhome wil ik weten wanneer er gevalideerd moet worden
  // op adminhome wil ik weten hoeveel credits ik nog heb

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

  logout(): void {
    this.clearAuthItem();
  }
}

interface JsonAuthItem {
  token: string;
  userId: number;
}

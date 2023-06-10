import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { User, UserId } from '../user';
import { JsonUser, UserMapper } from './mapper';
import { APIRepository } from '../repository';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserRepository extends APIRepository {

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private mapper: UserMapper,
    router: Router) {
    super(router);
  }

  getUrlpostfix(): string {
    return 'users';
  }

  getUrl(id: number | string): string {
    return super.getApiUrl() + this.getUrlpostfix() + '/' + id;
  }

  getLoggedInObject(): Observable<User | undefined> {
    const loggedInUserId = this.authService.getLoggedInUserId();
    if (loggedInUserId === undefined) {
      return of(undefined);
    }
    return this.getObject(loggedInUserId);
  }

  protected getObject(userId: UserId): Observable<User> {
    return this.http.get<JsonUser>(this.getUrl(userId.getId()), this.getOptions()).pipe(
      map((jsonUser: JsonUser) => this.mapper.toObject(jsonUser)),
      catchError((err: HttpErrorResponse) => this.handleError(err))
    );
  }

  editObject(json: JsonUser): Observable<User> {
    const url = this.getUrl(json.id);
    return this.http.put<JsonUser>(url, json, { headers: super.getHeaders() }).pipe(
      map((jsonUser: JsonUser) => this.mapper.toObject(jsonUser)),
      catchError((err: HttpErrorResponse) => this.handleError(err))
    );
  }

  removeObject(id: number | string): Observable<void> {
    const url = this.getUrl(id);
    return this.http.delete(url, this.getOptions()).pipe(
      map((res) => { }),
      catchError((err: HttpErrorResponse) => this.handleError(err))
    );
  }

  protected getOptions(): { headers: HttpHeaders; params: HttpParams } {
    const httpParams = new HttpParams();
    return {
      headers: super.getHeaders(),
      params: httpParams
    };
  }
}

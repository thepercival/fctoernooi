import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SportRepository } from 'ngx-sport';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { User } from '../user';
import { JsonUser, UserMapper } from './mapper';

@Injectable()
export class UserRepository extends SportRepository {
  private url: string;

  constructor(
    private http: HttpClient,
    router: Router,
    private mapper: UserMapper) {
    super(router);
    this.url = super.getApiUrl() + this.getUrlpostfix();
  }

  getUrlpostfix(): string {
    return 'users';
  }

  getObjects(): Observable<User[]> {
    return this.http.get<Array<JsonUser>>(this.url, this.getOptions()).pipe(
      map((jsonUsers: JsonUser[]) => jsonUsers.map(jsonUser => this.mapper.toObject(jsonUser))),
      catchError((err) => this.handleError(err))
    );
  }

  getObject(id: number): Observable<User> {
    const url = `${this.url}/${id}`;
    return this.http.get(url).pipe(
      map((res: JsonUser) => this.mapper.toObject(res)),
      catchError((err) => this.handleError(err))
    );
  }

  createObject(jsonObject: any): Observable<User> {
    return this.http.post(this.url, jsonObject, this.getOptions()).pipe(
      map((res: JsonUser) => this.mapper.toObject(res)),
      catchError((err) => this.handleError(err))
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

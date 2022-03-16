import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { User } from '../user';
import { JsonUser, UserMapper } from './mapper';
import { APIRepository } from '../repository';

@Injectable({
  providedIn: 'root'
})
export class UserRepository extends APIRepository {

  constructor(
    private http: HttpClient,
    private mapper: UserMapper) {
    super();
  }

  getUrlpostfix(): string {
    return 'users';
  }

  getUrl(id: number | string): string {
    return super.getApiUrl() + this.getUrlpostfix() + '/' + id;
  }

  getObject(id: string | number): Observable<User> {
    return this.http.get<JsonUser>(this.getUrl(id), this.getOptions()).pipe(
      map((jsonUser: JsonUser) => this.mapper.toObject(jsonUser)),
      catchError((err: HttpErrorResponse) => this.handleError(err))
    );
  }

  editObject(json: JsonUser): Observable<void> {
    const url = this.getUrl(json.id);
    return this.http.put(url, json, { headers: super.getHeaders() }).pipe(
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

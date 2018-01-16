import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SportRepository } from 'ngx-sport';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators/map';

import { User } from './user';

@Injectable()
export class UserRepository extends SportRepository {

  private url: string;

  constructor(private http: HttpClient) {
    super();
    this.url = super.getApiUrl() + this.getUrlpostfix();
  }

  getUrlpostfix(): string {
    return 'users';
  }

  getObjects(): Observable<User[]> {
    return this.http.get<Array<IUser>>(this.url, { headers: super.getHeaders() }).pipe(
      map((res: IUser[]) => {
        return this.jsonArrayToObject(res);
      })
    );
  }

  getObject(id: number): Observable<User> {
    const url = `${this.url}/${id}`;
    return this.http.get(url).pipe(
      map((res: IUser) => this.jsonToObjectHelper(res))
    );
  }

  createObject(jsonObject: any): Observable<User> {
    return this.http
      .post(this.url, jsonObject, { headers: super.getHeaders() }).pipe(
        map((res: IUser) => this.jsonToObjectHelper(res))
      );
  }

  jsonArrayToObject(jsonArray: IUser[]): User[] {
    const users: User[] = [];
    for (const json of jsonArray) {
      const object = this.jsonToObjectHelper(json);
      users.push(object);
    }
    return users;
  }

  jsonToObjectHelper(json: IUser): User {
    const user = new User(json.emailaddress);
    user.setId(json.id);
    user.setName(json.name);
    return user;
  }

  objectToJsonHelper(user: User): IUser {
    return {
      id: user.getId(),
      name: user.getName(),
      emailaddress: user.getEmailaddress()
    };
  }
}

export interface IUser {
  id?: number;
  name: string;
  emailaddress: string;
}

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SportRepository } from 'ngx-sport';
import { Observable } from 'rxjs/Rx';

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
    return this.http.get(this.url, { headers: super.getHeaders() })
      .map((res: IUser[]) => {
        return this.jsonArrayToObject(res);
      })
      .catch(this.handleError);
  }

  getObject(id: number): Observable<User> {
    const url = `${this.url}/${id}`;
    return this.http.get(url)
      // ...and calling .json() on the response to return data
      .map((res: IUser) => this.jsonToObjectHelper(res))
      // ...errors if any
      .catch(this.handleError);
  }

  createObject(jsonObject: any): Observable<User> {
    return this.http
      .post(this.url, jsonObject, { headers: super.getHeaders() })
      // ...and calling .json() on the response to return data
      .map((res: IUser) => this.jsonToObjectHelper(res))
      .catch(this.handleError);
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

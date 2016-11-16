import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';
import {Observable} from 'rxjs/Rx';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { User } from './user';
import { AuthenticationService } from '../auth/service';

@Injectable()
export class UserService {

    private headers = new Headers({'Content-Type': 'application/json'});
    private usersUrl = 'http://localhost:2999/users';

    constructor(
        private http: Http,
        private authenticationService: AuthenticationService) {
    }

    getUsers(): Observable<User[]> {
        let headers = new Headers({ 'Authorization': 'Bearer ' + this.authenticationService.token });
        let options = new RequestOptions({ headers: headers });
        return this.http.get(this.usersUrl, options)
            // ...and calling .json() on the response to return data
            .map((res:Response) => res.json())
            //...errors if any
            .catch((response:any) => { console.log( response.statusText ); /*Observable.throw(error.message || 'Server error')*/  });
    }

    /*getUsersSlow(): Observable<User[]> {

        setTimeout( () => {
            this.getUsers()
        });
        var source = new Observable<User[]>(resolve =>
            setTimeout(resolve, 2000)) // delay 2 seconds
            .then(() => );
        source.forEach( x => );
    }*/

    getUser(id: number): Observable<User> {
        // var x = this.getUsers().forEach(users => users.find(user => user.id === id));
        const url = `${this.usersUrl}/${id}`;
        return this.http.get(url)
        // ...and calling .json() on the response to return data
            .map((res:Response) => res.json().data)
            //...errors if any
            .catch((error:any) => Observable.throw(error.message || 'Server error' ));
    }

    create(name: string, seasonname: string): Observable<User> {

        return this.http
            .post(this.usersUrl, JSON.stringify({name: name, seasonname: seasonname, structure: '{}'}), {headers: this.headers})
            // ...and calling .json() on the response to return data
            .map((res:Response) => res.json().data)
            //...errors if any
            .catch((error:any) => Observable.throw(error.message || 'Server error'));
    }

    update(user: User): Observable<User> {

        const url = `${this.usersUrl}/${user.id}`;
        return this.http
            .put(url, JSON.stringify(user), {headers: this.headers})
            // ...and calling .json() on the response to return data
            .map((res:Response) => res.json())
            //...errors if any
            .catch((error:any) => Observable.throw(error.message || 'Server error'));
    }

    delete(id: number): Observable<void> {
        const url = `${this.usersUrl}/${id}`;
        return this.http
            .delete(url, {headers: this.headers})
            // ...and calling .json() on the response to return data
            .map((res:Response) => res.json().data)
            //...errors if any
            .catch((error:any) => Observable.throw(error.message || 'Server error'));
    }

    /*private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }*/
}

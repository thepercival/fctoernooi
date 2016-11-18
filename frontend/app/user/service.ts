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
    private usersUrl = 'http://localhost:2999/users';  // localhost:2999/users

    constructor(
        private http: Http,
        private authenticationService: AuthenticationService) {
    }

    getUsers(): Observable<User[]> {
        let headers = new Headers({ 'Authorization': 'Bearer ' + this.authenticationService.token, 'Content-Type': 'application/json' });
        // let options = new RequestOptions({ headers: headers });
        let options = new RequestOptions({ headers: headers });
        return this.http.get(this.usersUrl, options)
            // ...and calling .json() on the response to return data
            .map((res:Response) => res.json())
            //...errors if any
            .catch( this.handleError );
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
            .map((res:Response) => res.json())
            //...errors if any
            .catch((error:any) => Observable.throw(error.message || 'Server error' ));
    }

    create(name: string, seasonname: string): Observable<User> {

        return this.http
            .post(this.usersUrl, JSON.stringify({name: name, seasonname: seasonname, structure: '{}'}), {headers: this.headers})
            // ...and calling .json() on the response to return data
            .map((res:Response) => res.json())
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
            .map((res:Response) => res.json())
            //...errors if any
            .catch((error:any) => Observable.throw(error.message || 'Server error'));
    }

    private handleError (error: Response | any) {
        // In a real world app, we might use a remote logging infrastructure
        let errMsg: string;
        if (error instanceof Response) {
            // const body = error.json() || '';
            /*const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
            */
            const err = '';
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            // errMsg = error.message ? error.message : error.toString();
        }
        console.log( error );

        // console.error('testje');
        return Observable.throw(errMsg);

    }
}

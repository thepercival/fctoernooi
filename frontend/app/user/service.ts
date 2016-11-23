import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { User } from './user';
import { AuthenticationService } from '../auth/service';

@Injectable()
export class UserService {

    private headers = new Headers({'Content-Type': 'application/json'});
    private usersUrl : string;

    constructor(
        private http: Http,
        private authService: AuthenticationService) {
        this.usersUrl = authService.usersUrl;
    }

    getUsers(): Observable<User[]> {
        let headers = new Headers({ 'Authorization': 'Bearer ' + this.authService.token, 'Content-Type': 'application/json' });
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

    ngOnInit() {
        // reset login status
        this.authService.logout();
    }

    getUser(id: number): Observable<User> {
        // var x = this.getUsers().forEach(users => users.find(user => user.id === id));
        const url = `${this.usersUrl}/${id}`;
        return this.http.get(url)
        // ...and calling .json() on the response to return data
            .map((res:Response) => res.json())
            //...errors if any
            .catch(this.handleError);
    }

    create( newUser: User ): Observable<User> {
        return this.http
            .post(this.usersUrl, JSON.stringify( newUser ), {headers: this.headers})
            // ...and calling .json() on the response to return data
            .map((res:Response) => res.json())
            //...errors if any
            .catch(this.handleError);
    }

    update(user: User): Observable<User> {

        const url = `${this.usersUrl}/${user.id}`;
        return this.http
            .put(url, JSON.stringify(user), {headers: this.headers})
            // ...and calling .json() on the response to return data
            .map((res:Response) => res.json())
            //...errors if any
            .catch(this.handleError);
    }

    delete(id: number): Observable<void> {
        const url = `${this.usersUrl}/${id}`;
        return this.http
            .delete(url, {headers: this.headers})
            // ...and calling .json() on the response to return data
            .map((res:Response) => res.json())
            //...errors if any
            .catch(this.handleError);
    }

    // this could also be a private method of the component class
    handleError(error: any): Observable<any> {
        console.error( error.statusText );
        // throw an application level error
        return Observable.throw( error.statusText );
    }
}

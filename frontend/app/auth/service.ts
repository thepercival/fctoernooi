import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import { User } from '../user/user';

@Injectable()
export class AuthenticationService {
    public token: string;
    public userid: number;
    private authUrl = 'http://localhost:2999/auth/login';
    public usersUrl = 'http://localhost:2999/users';
    public user: User;

    constructor(private http: Http) {
        // set token if saved in local storage
        var user = JSON.parse(localStorage.getItem('user'));
        this.token = user && user.token;
        this.userid = user && user.id;
        // this.initLoggedOnUser();

        if ( this.token && this.userid && !this.user ){
            console.log( "auth.user starting initialization for userid: "+this.userid+"...");
            this.getLoggedInUser( this.userid ).forEach(user => this.user = user);
            console.log( "auth.user initialized");
        }
    }

    getLoggedInUser(id: number): Observable<User> {
        let headers = new Headers({ 'Authorization': 'Bearer ' + this.token, 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        const url = `${this.usersUrl}/${id}`;

        return this.http.get(url, options)
        // ...and calling .json() on the response to return data
            .map((res:Response) => res.json())
            //...errors if any
            .catch((error:any) => Observable.throw(error.message || 'Server error' ));
    }

    login(email, password): Observable<boolean> {
        return this.http.post( this.authUrl, { email: email, password: password })
            .map((response: Response) => {
                let json = response.json();
                // login successful if there's a jwt token in the response
                if (json && json.token && json.user ) {
                    // set token property
                    this.token = json.token;
                    this.userid = json.user.id;
                    // store username and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('user', JSON.stringify({ id: json.user.id, token: json.token }));
                    this.user = json.user;
                    console.log( this.user );

                    // return true to indicate successful login
                    return true;
                } else {
                    // return false to indicate failed login
                    return false;
                }
            })
            .catch(this.handleError);
            // .catch((error:any) => Observable.throw( error.statusText || 'Server error' ) );
            /*.catch((err:any) => {
                //console.log( err.statusText );
                Observable.throw( err.statusText )
            });*/
    }

    logout(): void {
        // clear token remove user from local storage to log user out
        this.token = null;
        this.user = null;
        this.userid = null;
        localStorage.removeItem('user');
    }

    // this could also be a private method of the component class
    handleError(error: any): Observable<any> {
        console.error( error.statusText );
        // throw an application level error
        return Observable.throw( error.statusText );
    }
}
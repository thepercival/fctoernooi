import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map'

@Injectable()
export class AuthenticationService {
    public token: string;
    private authUrl = 'http://localhost:2999/auth/login';

    constructor(private http: Http) {
        // set token if saved in local storage
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
    }

    login(username, password): Observable<boolean> {
        return this.http.post( this.authUrl, { email: username, password: password })
            .map((response: Response) => {
                let json = response.json();
                // login successful if there's a jwt token in the response
                let token = response.json() && response.json().token;
                if (json && json.token) {
                    // set token property
                    this.token = json.token;

                    // store username and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify({ username: username, token: json.token }));

                    // return true to indicate successful login
                    return true;
                } else {
                    // return false to indicate failed login
                    return false;
                }
            })
            .catch((response:any) => {
                console.log( response.statusText );
                // Observable.throw( response.statusText )
            });
    }

    logout(): void {
        // clear token remove user from local storage to log user out
        this.token = null;
        localStorage.removeItem('currentUser');
    }
}
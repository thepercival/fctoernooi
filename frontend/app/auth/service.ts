import { Injectable, OnInit } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import { User } from '../user/user';

@Injectable()
export class AuthenticationService implements OnInit{
    public token: string;
    private userid: number;
    private authUrl = 'http://localhost:2999/auth/login';
    public usersUrl = 'http://localhost:2999/users';
    public user: User;

    constructor(private http: Http) {
        // set token if saved in local storage
        var user = JSON.parse(localStorage.getItem('user'));
        this.token = user && user.token;
        this.userid = user && user.id;
    }

    ngOnInit() {
        /* dit wordt niet aangeroepen */
        if ( this.token && this.userid && !this.user ){
            console.log('hoppa3');
            this.getLoggedInUser( this.userid ).forEach(user => this.user = user);
        }
    }

    getLoggedInUser(id: number): Observable<User> {
        // var x = this.getUsers().forEach(users => users.find(user => user.id === id));
        const url = `${this.usersUrl}/${id}`;
        return this.http.get(url)
        // ...and calling .json() on the response to return data
            .map((res:Response) => res.json())
            //...errors if any
            .catch((error:any) => Observable.throw(error.message || 'Server error' ));
    }

    login(username, password): Observable<boolean> {
        return this.http.post( this.authUrl, { email: username, password: password })
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
                    console.log( 'as' );
                    console.log( this.user );

                    // return true to indicate successful login
                    return true;
                } else {
                    // return false to indicate failed login
                    return false;
                }
            })
            .catch((error:any) => Observable.throw(error.statusText || 'Server error' ));
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
}
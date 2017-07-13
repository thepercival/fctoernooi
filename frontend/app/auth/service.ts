import { Http, Headers, Response, RequestOptions } from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { User } from '../user/user';
import { Router } from '@angular/router';

@Injectable()
export class AuthenticationService {
    public token: string;
    public userid: number;
    private url = 'http://localhost:2999/auth/';    
    public user: User;  // is called from backend on first time
    private headers = new Headers({'Content-Type': 'application/json'});

    constructor(private http: Http, private router: Router) {
        // set token if saved in local storage
        var user = JSON.parse(localStorage.getItem('user'));
        this.token = user && user.token;
        this.userid = user && user.id;
        // this.initLoggedOnUser();

        if ( this.token && this.userid && !this.user ){
            console.log( "auth.user starting initialization for userid: "+this.userid+"...");
            this.getLoggedInUser( this.userid )
                .subscribe(
                    /* happy path */ user => this.user = user,
                    /* error path */ e => {
                        console.log('token expired');
                        this.logout();
                        this.router.navigate(['/']);
                    },
                    /* onComplete */ () => { console.log('user created from backend'); }
                );

            console.log( "auth.user initialized");
        }
    }

    // not through userservice because of recusrsive dependency
    getLoggedInUser(id: number): Observable<User> {
        let headers = new Headers({ 'Authorization': 'Bearer ' + this.token, 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        const url = `${this.url + 'users'}/${id}`;

        return this.http.get(url, options)
            // ...and calling .json() on the response to return data
            .map((res:Response) => res.json())
            //...errors if any
            .catch(this.handleError);
    }

    register( newUser: User ): Observable<User> {
        return this.http
            .post(this.url + 'register', JSON.stringify( newUser ), {headers: this.headers})
            // ...and calling .json() on the response to return data
            .map((res:Response) => res.json())
            //...errors if any
            .catch(this.handleError);
    }

    activate( email: string, activationkey : string ): Observable<boolean> {
        return this.http.post( this.url + 'activate', { email: email, activationkey: activationkey })
            .map((response: Response) => response.text() )
            .catch(this.handleError);
    }

    login(emailaddress, password): Observable<boolean> {
        return this.http.post( this.url + 'login', { emailaddress: emailaddress, password: password })
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
                    // console.log( this.user );

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

    passwordReset( email: string ): Observable<boolean> {
        return this.http.post( this.url + 'passwordreset', { email: email })
            .map((response: Response) => {
                let retVal = response.text()
                // console.log( retVal );
                return retVal;
            } )
            .catch(this.handleError);
    }

    passwordChange( email: string, password: string, key: string ): Observable<boolean> {
        return this.http.post( this.url + 'passwordchange', { email: email, password: password, key: key })
            .map((response: Response) => {
                let retVal = response.text();
                // console.log( retVal );
                return retVal;
            } )
            .catch(this.handleError);
    }

    logout(): void {
        // clear token remove user from local storage to log user out
        this.token = null;
        this.user = null;
        this.userid = null;
        localStorage.removeItem('user');
    }

    // this could also be a private method of the component class
    handleError(error: Response): Observable<any> {
        console.error( error.statusText );
        // throw an application level error
        return Observable.throw( error.statusText );
    }
}
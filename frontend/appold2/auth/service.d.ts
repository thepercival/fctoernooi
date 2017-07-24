import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import { User } from '../user/user';
import { Router } from '@angular/router';
export declare class AuthenticationService {
    private http;
    private router;
    token: string;
    userid: number;
    private url;
    user: User;
    private headers;
    constructor(http: Http, router: Router);
    getLoggedInUser(id: number): Observable<User>;
    register(newUser: User): Observable<User>;
    activate(email: string, activationkey: string): Observable<boolean>;
    login(emailaddress: any, password: any): Observable<boolean>;
    passwordReset(email: string): Observable<boolean>;
    passwordChange(email: string, password: string, key: string): Observable<boolean>;
    logout(): void;
    handleError(error: Response): Observable<any>;
}

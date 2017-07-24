import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import { User } from '../user/user';
import { Router } from '@angular/router';
export declare class AuthenticationService {
    private http;
    private router;
    token: string;
    userid: number;
    private authUrl;
    usersUrl: string;
    user: User;
    constructor(http: Http, router: Router);
    getLoggedInUser(id: number): Observable<User>;
    activate(email: string, activationkey: string): Observable<boolean>;
    login(email: any, password: any): Observable<boolean>;
    passwordReset(email: string): Observable<boolean>;
    passwordChange(email: string, password: string, key: string): Observable<boolean>;
    logout(): void;
    handleError(error: any): Observable<any>;
}

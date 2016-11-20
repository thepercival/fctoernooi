import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { User } from './user';
import { AuthenticationService } from '../auth/service';
export declare class UserService {
    private http;
    private authenticationService;
    private headers;
    private usersUrl;
    constructor(http: Http, authenticationService: AuthenticationService);
    getUsers(): Observable<User[]>;
    getUser(id: number): Observable<User>;
    create(name: string, seasonname: string): Observable<User>;
    update(user: User): Observable<User>;
    delete(id: number): Observable<void>;
    private handleError(error);
}

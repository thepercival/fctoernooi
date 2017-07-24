import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { User } from './user';
import { AuthenticationService } from '../auth/service';
export declare class UserService {
    private http;
    private authService;
    private headers;
    private usersUrl;
    constructor(http: Http, authService: AuthenticationService);
    getUsers(): Observable<User[]>;
    ngOnInit(): void;
    getUser(id: number): Observable<User>;
    create(newUser: User): Observable<User>;
    update(user: User): Observable<User>;
    delete(id: number): Observable<void>;
    handleError(error: any): Observable<any>;
}

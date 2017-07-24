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
    private url;
    constructor(http: Http, authService: AuthenticationService);
    getUsers(): Observable<User[]>;
    ngOnInit(): void;
    getUser(id: number): Observable<User>;
    create(newUser: User): Observable<User>;
    handleError(error: any): Observable<any>;
}

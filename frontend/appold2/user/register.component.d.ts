import { Router } from '@angular/router';
import { UserService } from './service';
import { AuthenticationService } from '../auth/service';
export declare class RegisterComponent {
    private router;
    private userService;
    private authService;
    model: any;
    loading: boolean;
    error: string;
    constructor(router: Router, userService: UserService, authService: AuthenticationService);
    register(): void;
}

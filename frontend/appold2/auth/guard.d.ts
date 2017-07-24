import { Router, CanActivate } from '@angular/router';
import { AuthenticationService } from './service';
export declare class AuthGuard implements CanActivate {
    private router;
    private authService;
    constructor(router: Router, authService: AuthenticationService);
    canActivate(): boolean;
}

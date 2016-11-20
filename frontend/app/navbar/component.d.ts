import { AuthenticationService } from '../auth/service';
import { Router } from '@angular/router';
export declare class NavbarComponent {
    private authenticationService;
    private router;
    title: string;
    constructor(authenticationService: AuthenticationService, router: Router);
    logout(): void;
}

import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../auth/service';
export declare class LogoutComponent implements OnInit {
    private router;
    private authenticationService;
    constructor(router: Router, authenticationService: AuthenticationService);
    ngOnInit(): void;
}

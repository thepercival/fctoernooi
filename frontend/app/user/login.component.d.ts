import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../auth/service';
export declare class LoginComponent implements OnInit {
    private router;
    private authenticationService;
    model: any;
    loading: boolean;
    error: string;
    constructor(router: Router, authenticationService: AuthenticationService);
    ngOnInit(): void;
    login(): void;
}

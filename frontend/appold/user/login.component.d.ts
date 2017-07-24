import { OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../auth/service';
export declare class LoginComponent implements OnInit {
    private activatedRoute;
    private router;
    private authenticationService;
    model: any;
    loading: boolean;
    private subscription;
    error: string;
    activationmessage: any;
    constructor(activatedRoute: ActivatedRoute, router: Router, authenticationService: AuthenticationService);
    ngOnInit(): void;
    login(): void;
}

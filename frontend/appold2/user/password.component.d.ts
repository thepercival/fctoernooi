import { OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../auth/service';
export declare class PasswordResetComponent {
    private router;
    private authService;
    model: any;
    loading: boolean;
    error: string;
    succeeded: boolean;
    constructor(router: Router, authService: AuthenticationService);
    passwordReset(): void;
}
export declare class PasswordChangeComponent implements OnInit, OnDestroy {
    private activatedRoute;
    private router;
    private authService;
    private subscription;
    private email;
    private key;
    model: any;
    loading: boolean;
    error: string;
    succeeded: boolean;
    constructor(activatedRoute: ActivatedRoute, router: Router, authService: AuthenticationService);
    ngOnInit(): void;
    ngOnDestroy(): void;
    passwordChange(): void;
}

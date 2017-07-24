import { OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from './service';
import { AuthenticationService } from '../auth/service';
export declare class ActivateComponent implements OnInit, OnDestroy {
    private activatedRoute;
    private router;
    private userService;
    private authService;
    private subscription;
    loading: boolean;
    error: string;
    constructor(activatedRoute: ActivatedRoute, router: Router, userService: UserService, authService: AuthenticationService);
    ngOnInit(): void;
    ngOnDestroy(): void;
    activate(): void;
}

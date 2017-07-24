/**
 * Created by coen on 10-2-17.
 */
import { OnInit } from '@angular/core';
import { AuthenticationService } from '../auth/service';
export declare class AdminComponent implements OnInit {
    private authService;
    constructor(authService: AuthenticationService);
    ngOnInit(): void;
}

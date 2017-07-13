import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthenticationService } from './service';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private router: Router, private authService: AuthenticationService) { }

    canActivate() {
        if ( this.authService.token ) {
            // logged in so return true
            return true;
        }
        console.log("this.authService.token is not set");
        // not logged in so redirect to login page
        this.router.navigate(['/login']);
        return false;
    }
}
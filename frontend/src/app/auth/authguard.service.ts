import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class AuthguardService implements CanActivate {

  constructor(private router: Router, private authService: AuthService) { }

  canActivate() {
    if ( this.authService.isLoggedIn() ) {
      // logged in so return true
      return true;
    }
    console.log('this.authService.token is not set');
    // not logged in so redirect to login page
    this.router.navigate(['/login']);
    return false;
  }

}

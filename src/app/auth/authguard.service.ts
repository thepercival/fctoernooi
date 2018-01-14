import { Injectable } from '@angular/core';
import { Router, CanActivate, NavigationExtras } from '@angular/router';
import { AuthService } from './auth.service';
import { IAlert } from '../app.definitions';

@Injectable()
export class AuthguardService implements CanActivate {

  constructor(private router: Router, private authService: AuthService) { }

  canActivate() {
    if ( this.authService.isLoggedIn() ) {
      // logged in so return true
      return true;
    }
    const navigationExtras: NavigationExtras = {
      queryParams: { type: 'warning', message: 'je bent niet ingelogd en teruggestuurd naar de homepagina' }
    };
    this.router.navigate(['/home'], navigationExtras );
    return false;
  }

}
